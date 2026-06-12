# syntax=docker/dockerfile:1

FROM php:8.2-fpm

# System-Abhängigkeiten, Nginx und PHP-Extensions für Laravel/Bagisto
RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        git \
        unzip \
        libicu-dev \
        libonig-dev \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        intl \
        mbstring \
        pdo_mysql \
        gd \
        zip \
        bcmath \
        exif \
        calendar \
        pcntl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer aus offiziellem Image übernehmen
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Eigene PHP-Konfiguration
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini

# Nginx-Konfiguration (ersetzt die Default-Site)
COPY docker/nginx.conf /etc/nginx/sites-available/default

WORKDIR /var/www/html

# App-Code (ohne .env und vendor – siehe .dockerignore)
COPY . .

# PHP-Abhängigkeiten installieren (vendor landet im Image)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Rechte für storage und bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
