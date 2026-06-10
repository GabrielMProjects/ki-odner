# Modul: compute (EC2 für k3s)

Wiederverwendbares Modul für eine **kleine EC2-Instanz**, auf der später per **Ansible k3s**
(leichtgewichtiges Kubernetes) installiert wird.

## Was es macht (nur bei `enable_compute = true`)

- **EC2-Instanz** (Default `t3.micro`) in einem öffentlichen Subnetz, mit öffentlicher IP.
- **AMI** automatisch über `data.aws_ami` (aktuelles **Ubuntu 22.04 LTS**, Canonical) – **keine harte AMI-ID**.
- **Security Group** für k3s:
  - SSH `22` – **nur** über `allowed_ssh_cidr`
  - HTTP `80` – öffentlich
  - HTTPS `443` – öffentlich
  - Kubernetes-API `6443` – **NICHT öffentlich**, nur über `allowed_k8s_api_cidr`
  - Egress: erlaubt
- **AWS Key Pair** aus deinem **öffentlichen** SSH-Key (`public_key` ODER `ssh_public_key_path`).

## ⚠️ Wichtig

- **`enable_compute = false` ist Standard** → es wird **nichts** erstellt. `terraform plan`
  zeigt dann keine Compute-Ressourcen.
- Bei `enable_compute = true` und `terraform apply` entstehen **echte AWS-Kosten** (EC2-Laufzeit, EBS).
- **Für die Bewerbungsdemo:** Instanz nur **kurz** starten, zeigen, und danach **sofort**
  `terraform destroy` ausführen.
- **Niemals private SSH-Keys committen** – hier wird ausschließlich der **öffentliche** Key genutzt.
  (Die `.gitignore` blockt `*.pem`/`*.key`/`*_rsa` etc.)
- **Kubernetes-API (6443) niemals öffentlich** (`0.0.0.0/0`) freigeben. Default ist auf das
  VPC-CIDR (`10.20.0.0/16`) beschränkt. Für Zugriff von außen besser über VPN/Bastion/SSH-Tunnel.

## 🔐 Hinweis zu `allowed_ssh_cidr`

Der Default ist `0.0.0.0/0` (offen), damit die Demo ohne Zusatzwissen funktioniert.
**Das ist nur für eine kurze Demo akzeptabel.** Für mehr als eine Wegwerf-Demo unbedingt auf
die eigene IP einschränken, z. B. `allowed_ssh_cidr = "203.0.113.10/32"`.

## Eingaben (Auswahl)

| Variable | Default | Zweck |
|---|---|---|
| `enable_compute` | `false` | Schalter – erst `true` erzeugt Ressourcen |
| `instance_type` | `t3.micro` | EC2-Größe (klein halten) |
| `vpc_id` / `public_subnet_id` | – | aus dem Netzwerk-Modul |
| `public_key` / `ssh_public_key_path` | `""` | öffentlicher SSH-Key |
| `allowed_ssh_cidr` | `0.0.0.0/0` | SSH-Zugriff (Demo offen, einschränken!) |
| `allowed_k8s_api_cidr` | `10.20.0.0/16` | k8s-API-Zugriff (nicht öffentlich) |

## Outputs

`instance_id`, `public_ip`, `public_dns`, `security_group_id`, `key_pair_name`, `enabled_compute`.
