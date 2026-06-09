# Deployment auf AWS

Diese Anleitung beschreibt, wie du **LaraShop** (Bagisto-Backend + Angular-Frontend) auf AWS
als **Live-Demo** bereitstellst – mit der einfachsten, günstigsten Variante für ein
Portfolio-/Bewerbungsprojekt.

> 💶 **Kosten-Hinweis:** Schritte, die Geld kosten **können**, sind mit 💶 markiert.
> Mit dem AWS **Free Tier** (12 Monate) ist die hier gewählte Variante in der Regel
> kostenlos oder im Cent-Bereich – **aber prüfe das selbst** und richte dir ein
> **Budget-Alarm** ein (siehe Schritt 0). Lösche die Ressourcen, wenn du sie nicht mehr brauchst.

---

## Architektur (einfachste Variante)

Eine einzige kleine EC2-Instanz (Free-Tier `t3.micro`) hostet alles:

```
        ┌──────────────────────── EC2 (t3.micro, Ubuntu) ────────────────────────┐
Browser │  Nginx ──► Angular-Build (statische Dateien)                            │
  ──────┤        └─► /api ──► PHP-FPM (Bagisto/Laravel)  ──►  MySQL (lokal)        │
        └──────────────────────────────────────────────────────────────────────────┘
```

Optional (Ausbaustufe): **RDS** statt lokaler MySQL, **S3** für Produktbilder, **CloudFront** als CDN.
Für eine Demo reicht die Single-Instance-Variante.

---

## Schritt 0 — Budget-Alarm einrichten (wichtig, kostenlos)

1. AWS-Konsole → **Billing and Cost Management** → **Budgets** → **Create budget**.
2. „Zero spend budget" oder ein Limit von z. B. **5 USD** wählen, deine E-Mail eintragen.
3. So bekommst du sofort eine Mail, falls doch Kosten entstehen.

---

## Schritt 1 — 💶 EC2-Instanz starten

1. Konsole → **EC2** → **Launch instance**.
2. **Name:** `larashop-demo`
3. **AMI:** Ubuntu Server 24.04 LTS (Free-Tier-fähig).
4. **Instance type:** `t3.micro` (Free Tier) — für Bagisto besser `t3.small` (💶 ~15 €/Monat), da Bagisto RAM-hungrig ist.
5. **Key pair:** neues erstellen, `.pem` sicher speichern (brauchst du für SSH).
6. **Security group** (= Firewall) — nur diese Ports öffnen:
   - `22` (SSH) — **nur deine IP** (Dropdown „My IP").
   - `80` (HTTP) — `0.0.0.0/0`
   - `443` (HTTPS) — `0.0.0.0/0`
7. **Storage:** 20–30 GB.
8. **Launch instance.**

---

## Schritt 2 — Server vorbereiten (SSH)

```bash
ssh -i larashop-key.pem ubuntu@<EC2-Public-IP>

# Pakete
sudo apt update && sudo apt install -y nginx mysql-server php8.2-fpm \
  php8.2-cli php8.2-mysql php8.2-intl php8.2-gd php8.2-mbstring php8.2-curl \
  php8.2-xml php8.2-zip php8.2-bcmath unzip git
# Composer
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
# Node (für den Angular-Build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
```

---

## Schritt 3 — Datenbank anlegen

```bash
sudo mysql
```
```sql
CREATE DATABASE bagisto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bagisto'@'localhost' IDENTIFIED BY 'EIN_SICHERES_PASSWORT';
GRANT ALL PRIVILEGES ON bagisto.* TO 'bagisto'@'localhost';
FLUSH PRIVILEGES; EXIT;
```

---

## Schritt 4 — Backend (Bagisto) deployen

```bash
cd /var/www && sudo git clone https://github.com/GabrielMProjects/ki-odner.git
sudo chown -R ubuntu:www-data ki-odner && cd ki-odner/lara

composer install --no-dev --optimize-autoloader
cp .env.example .env
```

In `.env` anpassen (siehe „Produktions-.env" unten), dann:

```bash
php artisan key:generate
php artisan migrate --force
# Demo-Produkte (optional, siehe README -> Demo-Daten)
php artisan storage:link
npm install && npm run build
php artisan optimize
sudo chown -R www-data:www-data storage bootstrap/cache
```

### Produktions-`.env` (wichtige Werte)

```
APP_ENV=production
APP_DEBUG=false                 # NIEMALS true in Produktion
APP_URL=https://deine-domain.de
APP_ADMIN_URL=admin

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=bagisto
DB_USERNAME=bagisto
DB_PASSWORD=EIN_SICHERES_PASSWORT

# Optional: Produktbilder in S3 statt lokal
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_DEFAULT_REGION=eu-central-1
# AWS_BUCKET=larashop-media
```

---

## Schritt 5 — Frontend (Angular) bauen

`angel/src/environments/environment.prod.ts` → `apiUrl` auf die öffentliche Backend-URL setzen,
z. B. `https://deine-domain.de/api`. Dann:

```bash
cd /var/www/ki-odner/angel
npm install --legacy-peer-deps
npm run build      # erzeugt dist/angel/browser
```

---

## Schritt 6 — Nginx konfigurieren

`/etc/nginx/sites-available/larashop` (Frontend statisch + `/api` ans Backend):

```nginx
server {
    listen 80;
    server_name deine-domain.de;

    # Angular-Frontend
    root /var/www/ki-odner/angel/dist/angel/browser;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }

    # Bagisto-Backend unter /api, /admin, /cache, /storage
    location ~ ^/(api|admin|cache|storage) {
        root /var/www/ki-odner/lara/public;
        try_files $uri /index.php?$query_string;
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        }
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/larashop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> Hinweis: Bagisto erwartet sein eigenes `public/` als Root. Für eine saubere Trennung kann
> man Frontend und Backend auch auf **zwei Subdomains** legen (`shop.` + `api.`) – das ist
> robuster als die kombinierte Variante oben.

---

## Schritt 7 — 💶 (optional) Domain + HTTPS

1. Domain bei Route 53 (💶) oder einem anderen Anbieter, A-Record auf die EC2-IP.
2. Kostenloses Zertifikat via Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d deine-domain.de
   ```

---

## Aufräumen (Kosten vermeiden)

Wenn die Demo nicht mehr gebraucht wird: in der EC2-Konsole die Instanz **Terminate**,
zugehörige **Elastic IP** freigeben und ggf. **S3-Bucket** leeren/löschen.

---

## Ausbaustufen (für mehr „Senior"-Eindruck im Lebenslauf)

- **RDS** (verwaltete MySQL) statt lokaler DB → Trennung von Daten und Server.
- **S3 + CloudFront** für Produktbilder → löst das „Medien nicht im Repo"-Thema sauber.
- **CI/CD** via GitHub Actions → automatisches Deployment bei jedem Push.
- **Docker / ECS** → containerisiertes Deployment.
