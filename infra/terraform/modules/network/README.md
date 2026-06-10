# Modul: network

Wiederverwendbares Netzwerk-Modul für AWS.

## Was es macht

Erstellt eine isolierte Netzwerkbasis:

- **VPC** (DNS-Support + DNS-Hostnames aktiv).
- **2+ öffentliche Subnetze** (`map_public_ip_on_launch = true`) – für öffentlich
  erreichbare Komponenten (z. B. Webserver, Load Balancer).
- **2+ private Subnetze** (keine öffentliche IP) – für DB/Backend ohne direkten Internetzugang.
- **Internet Gateway** + öffentliche Route Table (`0.0.0.0/0` → IGW).
- **Private Route Table** (Standard ohne Internet-Route).
- **Optionales NAT Gateway** + private Route (`0.0.0.0/0` → NAT) – **nur** bei `enable_nat_gateway = true`.

Die Availability Zones werden **automatisch** über `data.aws_availability_zones.available`
ermittelt – es sind **keine** festen AZ-Namen (wie `eu-central-1a`) im Code.

## Warum NAT Gateway standardmäßig AUS ist

Ein NAT Gateway ist die einzige **kostenpflichtige** Komponente hier: Es kostet pro Stunde
**und** pro übertragenem GB – auch im „Leerlauf". Für eine Demo ist das selten nötig, daher:

```
enable_nat_gateway = false   # Standard
```

Private Subnetze haben dann schlicht keinen ausgehenden Internetzugang – was für eine
Demo völlig in Ordnung ist.

## terraform plan vs. apply

- `terraform plan` ist **okay** und sicher – es zeigt nur eine **Vorschau**, was erstellt würde.
- `terraform apply` würde **echte AWS-Ressourcen** erzeugen (VPC, Subnetze, IGW, Route Tables;
  bei aktiviertem Toggle zusätzlich EIP + NAT Gateway).

## 💶 Kostenhinweis

- VPC, Subnetze, IGW, Route Tables: **kostenlos**.
- NAT Gateway (nur wenn aktiviert): **kostenpflichtig** – nach der Demo unbedingt via
  `terraform destroy` wieder entfernen.

## Eingaben (wichtigste)

| Variable | Default | Zweck |
|---|---|---|
| `name_prefix` | – (Pflicht) | Präfix für Ressourcennamen |
| `vpc_cidr` | `10.20.0.0/16` | CIDR der VPC |
| `public_subnet_cidrs` | `["10.20.0.0/24","10.20.1.0/24"]` | min. 2 (validiert) |
| `private_subnet_cidrs` | `["10.20.10.0/24","10.20.11.0/24"]` | min. 2 (validiert) |
| `enable_nat_gateway` | `false` | NAT Gateway (kostenpflichtig) |
| `tags` | `{}` | zusätzliche Tags |

## Outputs

`vpc_id`, `public_subnet_ids`, `private_subnet_ids`, `internet_gateway_id`,
`public_route_table_id`, `private_route_table_id`, `nat_gateway_id` (optional),
`enabled_nat_gateway`.
