#!/bin/sh
set -e

cd /var/www/html

php artisan storage:link --force

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec apache2-foreground
