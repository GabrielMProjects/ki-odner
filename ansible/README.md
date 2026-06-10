# ansible

Konfigurationsmanagement / Server-Provisioning für die EC2-Instanz(en).

**Zweck:** Reproduzierbares Einrichten des Servers (PHP, Nginx, MySQL/Client, Node,
App-Deployment) – statt manueller SSH-Schritte.

- Lokal testbar (z. B. gegen eine lokale VM oder einen Container) bevor es an AWS geht.
- Keine Secrets im Repo – sensible Werte kommen aus Vault/Umgebungsvariablen.

> Playbooks und Inventories werden in einem späteren Abschnitt befüllt.
