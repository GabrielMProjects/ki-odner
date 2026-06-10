# LaraShop – Angular Storefront mit Bagisto-Backend

Ein E-Commerce-Projekt aus zwei Teilen: ein **Angular-18-Frontend** (`angel/`), das einen
**Bagisto-/Laravel-Shop** (`lara/`) über dessen REST-API anspricht.

> Demo-Projekt – zeigt Aufbau eines entkoppelten Frontends (Angular + NgRx + Angular Material)
> auf einem bestehenden Laravel-E-Commerce-Backend.

---

## 🎯 Projektziel

Dieses Repository zeigt den **gesamten Weg von der laufenden Anwendung bis zum Cloud-Deployment**:

1. Eine funktionierende E-Commerce-App (Angular-Frontend + Bagisto/Laravel-Backend).
2. Eine **produktionsnahe DevOps-/Infrastruktur-Schicht** rundherum – Infrastructure as Code,
   Konfigurationsmanagement, Kubernetes, Observability und CI/CD.

Ziel ist, **nicht nur App-Entwicklung**, sondern auch **Infrastruktur- und Deployment-Kompetenz**
nachvollziehbar zu demonstrieren – mit Fokus auf *sicher, kostenbewusst und reproduzierbar*.

## 🏗️ Architekturüberblick

```
App-Schicht        angel (Angular 18)  ──HTTP──►  lara (Bagisto/Laravel REST-API)  ──►  MySQL
                          │
Infra-Schicht      infra/terraform   →  AWS Infrastruktur als Code (nur Dateien, kein Auto-Apply)
(dieses Repo)      ansible           →  Server-Provisioning (PHP, Nginx, DB, App)
                   helm/angel-lara   →  Kubernetes-Deployment (optional)
                   observability     →  Monitoring/Logging (Prometheus/Grafana)
                   .github/workflows →  CI/CD (Lint, Build, Test, terraform plan)
                   scripts           →  Helfer inkl. destroy.sh (Aufräumen)
```

**Leitplanken:**
- **Erst lokal testbar**, dann optional in die Cloud.
- AWS-Ressourcen werden **nie automatisch** erstellt – `terraform apply` machst du bewusst selbst.
- Optionale/kostenträchtige Module sind **standardmäßig aus**: `enable_rds`, `enable_elasticache`,
  `enable_cloudfront`, `enable_nat_gateway`, `enable_load_balancer` = `false`.
- Für die echte Demo nur **kleine Instanzen** (`t3.micro`/`t3.small`).

## 💶 Kostenhinweis

- **Lokale Entwicklung ist kostenlos.**
- Ein AWS-Deployment ist **optional** und kommt später; dann nur kleine/Free-Tier-Instanzen.
- **Nichts** wird automatisch provisioniert – du behältst die Kontrolle über jeden kostenpflichtigen Schritt.
- `scripts/destroy.sh` entfernt nach der Demo **alle** erstellten Ressourcen wieder.
- Empfohlen: vorab einen **Budget-Alarm** in AWS einrichten (siehe [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 📸 Screenshots

**Startseite**

![Startseite](docs/01-home.png)

**Produktübersicht**

![Produktübersicht](docs/02-products.png)

**Produktdetail**

![Produktdetail](docs/03-product-detail.png)

---

## 🧱 Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend | Angular 18, Angular Material, NgRx, RxJS, TypeScript |
| Backend | Bagisto (Laravel 11), PHP 8.2, REST-API |
| Datenbank | MySQL 8 / MariaDB |
| Build | Vite (Backend-Assets), Angular CLI |

**Architektur:** Das Angular-Frontend ist eigenständig und kommuniziert ausschließlich über
HTTP mit der Bagisto-API. Die API-Basis-URL steht in `angel/src/environments/environment.ts`
(Standard: `http://localhost:8000/api`).

---

## ✅ Voraussetzungen

- PHP **8.2+** inkl. Extensions: `intl`, `gd`, `pdo_mysql`, `mbstring`, `curl`, `openssl`, `tokenizer`, `calendar`, `bcmath`, `zip`
- **Composer** 2.x
- **Node.js** 18+ (empfohlen 20/22) und npm
- **MySQL 8** oder MariaDB (lokal oder via Docker)

---

## 🚀 Setup

### 1. Backend (`lara/` – Bagisto)

```bash
cd lara

# Abhängigkeiten
composer install

# Umgebungsdatei anlegen und Datenbank-Zugang eintragen
cp .env.example .env
#   -> in .env folgende Werte setzen:
#      DB_DATABASE=<deine_db>
#      DB_USERNAME=<user>
#      DB_PASSWORD=<passwort>
#      DB_PORT=3306

# App-Key + Installation (Migrationen + Seed)
php artisan key:generate
php artisan bagisto:install

# Frontend-Assets des Backends bauen
npm install
npm run build

# Server starten -> http://localhost:8000
php artisan serve
```

Admin-Bereich: `http://localhost:8000/admin`
(Login-Daten werden während `bagisto:install` festgelegt.)

### 2. Frontend (`angel/` – Angular)

```bash
cd angel

# Hinweis: --legacy-peer-deps ist nötig (siehe "Bekannte Hinweise")
npm install --legacy-peer-deps

# Dev-Server starten -> http://localhost:4200
npm start
```

Das Frontend erwartet, dass das Backend unter `http://localhost:8000` läuft.

---

## 🛍️ Demo-Daten (Beispielprodukte mit Bildern)

Eine frische Installation ist leer. Für einen gefüllten Shop (wie in den Screenshots)
gibt es zwei Wege:

**A) Beim Installer mitnehmen:** Während `php artisan bagisto:install` bei der Frage nach
Beispielprodukten `true` wählen.

**B) Nachträglich seeden** (Beispielprodukte inkl. mitgelieferter Bilder), danach neu indexieren:

```bash
cd lara
php artisan tinker --execute="app(\Webkul\Installer\Helpers\DatabaseManager::class)->seedSampleProducts(['default_locale'=>'en','allowed_locales'=>['en'],'default_currency'=>'USD','allowed_currencies'=>['USD']]);"
php artisan indexer:index --mode=full
```

Danach zeigt das Frontend Produkte mit Bildern. Diese Demo-Produkte liegen nur in der
Datenbank (nicht im Repository).

---

## 🗄️ Datenbank ohne lokale Installation (optional, via Docker)

```bash
docker run -d --name larashop-db \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=bagisto \
  -p 3306:3306 mysql:8.0
```

Passenden Zugang dann in `lara/.env` eintragen (`DB_USERNAME=root`, `DB_PASSWORD=secret`).

---

## ℹ️ Bekannte Hinweise

- **NgRx-Versionen:** In `angel/package.json` sind die `@ngrx/*`-Pakete auf `^21` gepinnt,
  während das Projekt auf Angular 18 läuft. Daher ist beim Install
  `npm install --legacy-peer-deps` erforderlich. Saubere Lösung: NgRx auf eine zu Angular 18
  passende Version (18.x) setzen.
- **Produktbilder:** Hochgeladene Medien liegen in `lara/storage/app/public/` und sind –
  wie bei Laravel üblich – per `.gitignore` **nicht** im Repository. Eine frische Installation
  zeigt daher Platzhalter (`assets/no-image.png`), bis Produkte mit Bildern angelegt werden.
  Bagisto kann beim Installer optional **Beispielprodukte inkl. Bildern** erzeugen.
- **`.env`:** Enthält Zugangsdaten und ist gitignored. Niemals committen.

---

## ☁️ Deployment (AWS)

Eine vollständige Schritt-für-Schritt-Anleitung für das Deployment als Live-Demo auf AWS
(EC2 + Nginx, optional RDS/S3/CloudFront) steht in **[DEPLOYMENT.md](DEPLOYMENT.md)** –
inkl. Kosten-Hinweisen und Free-Tier-Tipps.

---

## 📂 Projektstruktur

```
ki-odner/
├── angel/   # Angular-18-Frontend (Storefront "LaraShop")
└── lara/    # Bagisto-/Laravel-Backend (REST-API + Admin)
```
