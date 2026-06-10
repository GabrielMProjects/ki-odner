# Modul: ecr

Erstellt **ECR-Repositories** für die App-Images – **nur** wenn `enable_ecr = true`
(Standard: `false`, es wird nichts erstellt).

Repositories (Kurznamen): `backend`, `frontend`
Vollständiger Name im Cluster-Kontext: `<name_prefix>/<repo>`, z. B. `angel-lara-demo/backend`.

## Image-Namensschema

```
<aws_account_id>.dkr.ecr.<region>.amazonaws.com/<name_prefix>/<repo>:<tag>
```

Beispiel:
```
123456789012.dkr.ecr.eu-central-1.amazonaws.com/angel-lara-demo/backend:1.0.0
123456789012.dkr.ecr.eu-central-1.amazonaws.com/angel-lara-demo/frontend:1.0.0
```

Empfehlung für `<tag>`: der **Git-Commit-SHA** (z. B. `git rev-parse --short HEAD`) statt `latest`
→ reproduzierbar und eindeutig.

## Push-Ablauf (später, bewusst – erfordert AWS-Login)

```bash
# Login (read-only Token holen):
aws ecr get-login-password --region eu-central-1 \
  | docker login --username AWS --password-stdin <account>.dkr.ecr.eu-central-1.amazonaws.com

# Taggen + Pushen:
docker tag angel-lara/backend:latest  <account>.dkr.ecr.eu-central-1.amazonaws.com/angel-lara-demo/backend:<tag>
docker push                           <account>.dkr.ecr.eu-central-1.amazonaws.com/angel-lara-demo/backend:<tag>
```

Im Helm-Chart dann `backend.image.repository` / `frontend.image.repository` auf die ECR-URLs setzen.

## 💶 Kosten
Leere Repos sind praktisch kostenlos; Kosten entstehen durch **gespeicherte Images** (Storage)
und **Datentransfer**. Nach der Demo Images/Repos wieder löschen (siehe Runbook).
