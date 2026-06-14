#!/bin/sh
set -e

cd /var/www/html

# ─── Optionale Optimierungen (per ENV steuerbar) ─────────────────────
# Standard bewusst zurückhaltend; nichts wird erzwungen.

if [ "${RUN_CONFIG_CACHE:-false}" = "true" ]; then
    echo "[entrypoint] php artisan config:cache"
    php artisan config:cache || true
fi

if [ "${RUN_ROUTE_CACHE:-false}" = "true" ]; then
    echo "[entrypoint] php artisan route:cache"
    php artisan route:cache || true
fi

if [ "${RUN_STORAGE_LINK:-true}" = "true" ]; then
    echo "[entrypoint] php artisan storage:link"
    php artisan storage:link || true
fi

# WICHTIG: Es werden KEINE Migrationen automatisch erzwungen.
# Das macht der Nutzer bewusst (z. B. `docker compose exec backend php artisan migrate`).

# Rechte sicherstellen (falls Volumes gemountet wurden)
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# PHP-FPM im FOREGROUND (-F), von der Shell backgrounded -> erbt Container-stdout/stderr,
# damit catch_workers_output (Laravel-Logs) wirklich an den Container-Output gelangt.
php-fpm -F &

exec "$@"
