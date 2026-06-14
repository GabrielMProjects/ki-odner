<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Trace\SpanKind;
use OpenTelemetry\API\Trace\StatusCode;

class TraceRequests
{
    public function handle(Request $request, Closure $next)
    {
        $route = optional($request->route())->uri() ?: $request->path();
        $span = Globals::tracerProvider()->getTracer('app.http')
            ->spanBuilder($request->method() . ' ' . $route)
            ->setSpanKind(SpanKind::KIND_SERVER)
            ->startSpan();
        $span->setAttribute('http.request.method', $request->method())
            ->setAttribute('url.path', '/' . ltrim($request->path(), '/'))
            ->setAttribute('url.scheme', $request->getScheme())
            ->setAttribute('http.route', $route)
            ->setAttribute('server.address', $request->getHost());
        $scope = $span->activate();

        try {
            $response = $next($request);
            if (is_object($response) && method_exists($response, 'getStatusCode')) {
                $code = $response->getStatusCode();
                $span->setAttribute('http.response.status_code', $code);
                if ($code >= 500) {
                    $span->setStatus(StatusCode::STATUS_ERROR);
                }
            }

            return $response;
        } catch (\Throwable $e) {
            // Exception als Span-Fehler markieren, dann normal weiterwerfen.
            $span->recordException($e);
            $span->setStatus(StatusCode::STATUS_ERROR, $e->getMessage());
            throw $e;
        } finally {
            // Zuverlaessig: Span wird IMMER beendet, unabhaengig von terminate().
            $scope->detach();
            $span->end();
        }
    }

    public function terminate(Request $request, $response): void
    {
        // Span ist bereits in handle() beendet. Hier nur best-effort Flush NACH
        // gesendeter Response (keine zusaetzliche Request-Latenz). Faellt terminate()
        // aus, exportiert der BatchSpanProcessor ohnehin per Schedule/Shutdown.
        $tp = Globals::tracerProvider();
        if (method_exists($tp, 'forceFlush')) {
            $tp->forceFlush();
        }
    }
}
