<?php

namespace App\Providers;

use Illuminate\Queue\Events\JobExceptionOccurred;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Trace\SpanKind;
use OpenTelemetry\API\Trace\StatusCode;

class OpenTelemetryServiceProvider extends ServiceProvider
{
    /** @var array<string,array{0:\OpenTelemetry\API\Trace\SpanInterface,1:\OpenTelemetry\Context\ScopeInterface}> */
    private array $jobSpans = [];

    public function register(): void
    {
        // Provider-Setup macht der SDK-env-Autoloader (OTEL_PHP_AUTOLOAD_ENABLED=true).
        // Middleware ist stateless (Span endet in handle()) -> kein Singleton noetig.
    }

    public function boot(): void
    {
        Queue::before(function (JobProcessing $event) {
            $job = $event->job;
            $span = Globals::tracerProvider()->getTracer('app.queue')
                ->spanBuilder('queue ' . $job->resolveName())
                ->setSpanKind(SpanKind::KIND_CONSUMER)
                ->startSpan();
            $span->setAttribute('messaging.system', 'redis')
                ->setAttribute('messaging.destination.name', $job->getQueue() ?? 'default')
                ->setAttribute('messaging.operation', 'process')
                ->setAttribute('messaging.message.id', (string) $this->jobKey($job));
            $scope = $span->activate();
            $this->jobSpans[$this->jobKey($job)] = [$span, $scope];
        });

        Queue::after(function (JobProcessed $event) {
            $this->endJobSpan($this->jobKey($event->job));
        });

        Queue::exceptionOccurred(function (JobExceptionOccurred $event) {
            $key = $this->jobKey($event->job);
            if (isset($this->jobSpans[$key])) {
                [$span] = $this->jobSpans[$key];
                $span->recordException($event->exception);
                $span->setStatus(StatusCode::STATUS_ERROR, $event->exception->getMessage());
            }
            $this->endJobSpan($key);
        });
    }

    /** Stabiler Key: getJobId() kann leer sein -> Fallback auf spl_object_id. */
    private function jobKey(object $job): string
    {
        $id = method_exists($job, 'getJobId') ? (string) $job->getJobId() : '';

        return $id !== '' ? $id : 'obj-' . spl_object_id($job);
    }

    private function endJobSpan(string $key): void
    {
        if (! isset($this->jobSpans[$key])) {
            return;
        }
        [$span, $scope] = $this->jobSpans[$key];
        $scope->detach();
        $span->end();
        unset($this->jobSpans[$key]);

        // Langlebiger CLI-Worker -> Spans pro Job explizit exportieren.
        $tp = Globals::tracerProvider();
        if (method_exists($tp, 'forceFlush')) {
            $tp->forceFlush();
        }
    }
}
