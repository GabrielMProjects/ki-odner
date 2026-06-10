# Lokaler Kubernetes-Nachweis (kind + Helm)

**Datum:** 2026-06-10
**Umgebung:** rein **lokal** – **kein AWS**, keine Cloud-Ressourcen, **keine Kosten**.
Alle Secrets sind **Demo-Werte** (lokal generiert, nicht committet).

Ziel: nachweisen, dass das Helm-Chart `helm/angel-lara` echte Kubernetes-Ressourcen erstellt
und die Anwendung im Cluster funktioniert.

---

## Verwendete Tools

| Tool | Version |
|---|---|
| Docker | 29.4.1 |
| kind | v0.32.0 |
| Kubernetes (kind node) | v1.36.1 |
| kubectl | v1.34.1 |
| Helm | v4.1.4 |

---

## Durchgeführte Schritte (Befehle)

```bash
# 1) Lokalen Cluster erstellen
kind create cluster --name angel-lara

# 2) Images lokal bauen
docker build -t angel-lara/frontend:latest ./angel
docker build -t angel-lara/backend:latest  ./lara

# 3) Images in den kind-Cluster laden
kind load docker-image angel-lara/frontend:latest --name angel-lara
kind load docker-image angel-lara/backend:latest  --name angel-lara

# 4) Test-Abhängigkeiten (MySQL + Redis) im Cluster (Demo-Werte)
kubectl apply -f docs/k8s/local-deps.yaml

# 5) Helm-Chart installieren (Demo-APP_KEY lokal generiert, NICHT committet)
APP_KEY="base64:$(openssl rand -base64 32)"
helm install angel-lara helm/angel-lara -n angel-lara \
  --set-string secrets.APP_KEY="$APP_KEY" \
  --set-string secrets.DB_PASSWORD=secret \
  --set ingress.enabled=true

# 6) Datenbank migrieren + Basisdaten seeden (im Backend-Pod)
kubectl exec -n angel-lara deploy/angel-lara-backend -- php artisan migrate --force
kubectl exec -n angel-lara deploy/angel-lara-backend -- php artisan tinker --execute=\
  "app(\Webkul\Installer\Database\Seeders\DatabaseSeeder::class)->run([...]);"

# 7) Nachweise
helm status angel-lara -n angel-lara
kubectl get all -n angel-lara
kubectl get pods,svc,ingress -n angel-lara -o wide
```

---

## Ergebnisse

### Helm-Release
```
NAME: angel-lara   STATUS: deployed   REVISION: 1
```

### Erstellte Ressourcen (aus `helm get manifest`)
```
1 ConfigMap   1 Secret   3 Deployment   2 Service   1 Ingress   1 CronJob
```

### Pods (`kubectl get all`)
```
pod/angel-lara-backend-…     1/1   Running
pod/angel-lara-frontend-…    1/1   Running
pod/angel-lara-worker-…      1/1   Running
pod/angel-lara-scheduler-…   0/1   Completed   <- CronJob ist gefeuert & erfolgreich
pod/mysql-…                  1/1   Running
pod/redis-…                  1/1   Running
```

### Services
```
service/angel-lara-backend    ClusterIP   8000/TCP
service/angel-lara-frontend   ClusterIP   80/TCP
service/mysql                 ClusterIP   3306/TCP
service/redis                 ClusterIP   6379/TCP
```

### Ingress
```
ingress/angel-lara   CLASS=traefik   HOST=angel-lara.local   PORTS=80
```

### Datenbank
- `php artisan migrate --force`: **alle Bagisto-Migrationen DONE** (Tabellen angelegt) →
  Backend ⇄ MySQL-Verbindung nachgewiesen.
- Basis-Seed: `channels = 1` (Channel/Locale/Currency vorhanden).

### HTTP-Funktionsnachweis (per `kubectl port-forward`, Host = `localhost`)
| Endpoint | Ergebnis |
|---|---|
| Frontend (Angular) `:80` | **200** |
| Backend `/api/products` | **200** (valides JSON `{"data":[],…}`) |
| Backend `/admin/login` | **200** |

---

## Bekannte Einschränkungen

1. **Migration-Job (Helm-Hook):** Im Chart ist der Migration-Job als `pre-install`-Hook
   definiert. Helm führt `pre-install`-Hooks **vor** den normalen Ressourcen (ConfigMap/Secret)
   aus → der Hook hätte die DB-Zugangsdaten (`envFrom`) noch nicht. Für diesen Nachweis wurden
   die Migrationen daher **manuell** per `kubectl exec` ausgeführt (kein Chart-Eingriff).
   *Vorgeschlagener minimaler Fix später:* ConfigMap/Secret ebenfalls als Hook mit niedrigerem
   `hook-weight` rendern **oder** den Job auf `post-install` umstellen.
2. **Demo-Daten:** Es wurden nur **Basisdaten** geseedet (keine Beispielprodukte) → die API
   liefert eine leere, aber valide Produktliste. Beispielprodukte ließen sich analog seeden.
3. **Channel-Hostname:** Bagisto löst den Channel über den Request-Host auf. In-Cluster-Aufrufe
   mit Host `angel-lara-backend` ergeben 500; mit Host `localhost` (Port-Forward) → 200.
   In einer echten Umgebung wird der Channel-Hostname passend gesetzt.
4. **Ingress-Routing:** Das Ingress-Objekt wird erstellt; für echtes Routing braucht der Cluster
   einen Ingress-Controller (z. B. Traefik). Für den Nachweis genügt das erstellte Objekt +
   der Service-Zugriff per Port-Forward.
5. **MySQL/Redis:** Für den lokalen Test im Cluster bereitgestellt (Demo-Werte, kein Persistent
   Volume). In der Cloud würde man RDS/externes Redis nutzen.

---

## Fazit

✅ **Der lokale Kubernetes-Nachweis war erfolgreich.** Das Helm-Chart erzeugt alle erwarteten
Ressourcen, alle Pods laufen, der Scheduler-CronJob feuert erfolgreich, das Backend ist mit
MySQL/Redis verbunden und migriert, und Frontend, Backend-API und Admin-Login antworten mit
HTTP **200** – **vollständig lokal, ohne AWS und ohne Kosten**.

### Aufräumen
```bash
kind delete cluster --name angel-lara
```
Entfernt Cluster + alle Container restlos – es bleiben keine Ressourcen und keine Kosten zurück.
