# Lokaler Betrieb mit Docker

Dieser Stack containerisiert die bestehende App: **Angular-Frontend** + **Bagisto/Laravel-Backend**
plus **MySQL** und **Redis** – alles lokal, **ohne AWS**.

## Ports

| Dienst | URL / Port |
|---|---|
| Frontend (Angular) | http://localhost:8080 |
| Backend (Bagisto)  | http://localhost:8000 |
| MySQL | `localhost:3307` |
| Redis | `localhost:6379` |

## Voraussetzung: lokale `.env`

Die `.env` wird **nicht** ins Image und **nicht** ins Repo committet – du erstellst sie lokal:

```bash
cd lara
cp .env.example .env
php artisan key:generate      # oder einen APP_KEY in .env eintragen
```

Die DB-/Redis-Verbindung zu den Containern wird über Umgebungsvariablen in
`docker-compose.yml` gesetzt (`DB_HOST=mysql`, `REDIS_HOST=redis` …) und überschreibt die
Werte aus der `.env`. Du musst in der `.env` also nur App-Werte wie `APP_KEY` pflegen.

> ⚠️ **Keine echten Secrets** in `.env`, `docker-compose.yml` oder ins Repo. Die hier
> verwendeten Werte (`bagisto`/`secret`) sind reine **Demo-Werte**.

## Befehle

```bash
# Images bauen
docker compose build

# Stack im Hintergrund starten
docker compose up -d

# Logs verfolgen
docker compose logs -f

# Stack stoppen (Container entfernen)
docker compose down

# Stack inkl. MySQL-Daten-Volume entfernen
docker compose down -v
```

## Erststart: Datenbank befüllen (bewusst, keine Auto-Migration)

Der Container erzwingt **keine** Migrationen. Beim ersten Start bewusst ausführen:

```bash
docker compose exec backend php artisan migrate --force
# optional: Beispielprodukte (siehe Haupt-README -> Demo-Daten)
```

## Troubleshooting (Laravel-Cache)

Wenn nach Änderungen an `.env`/Config etwas „hängt":

```bash
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear
```

## Hinweise

- `docker compose build` baut beide Images aus dem **bestehenden** Code (`./angel`, `./lara`)
  – der App-Code wird dafür nicht verändert.
- Das Backend-Image enthält Nginx **und** PHP-FPM; das Frontend-Image liefert den statischen
  Angular-Build über Nginx aus (SPA-Fallback auf `index.html`).
