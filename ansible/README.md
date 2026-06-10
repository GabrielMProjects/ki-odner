# ansible

Provisioning eines Ubuntu-Hosts (später die Terraform-EC2) zu einem **k3s-Node**.

> **Stand:** Es wird **noch nichts ausgeführt** und **kein Server verändert**.
> Diese Struktur ist nur vorbereitet – das Ausführen passiert bewusst später durch dich.

## Struktur

```
ansible/
├─ ansible.cfg              # Grundkonfiguration (Inventory, roles_path ...)
├─ inventory.example.ini    # Vorlage – kopieren nach inventory.ini
├─ playbooks/
│  ├─ site.yml              # vollständig: common → security → docker → k3s → helm
│  └─ k3s.yml              # nur: k3s → helm
└─ roles/
   ├─ common/   # apt-Update, Basis-Pakete, optional Zeitzone
   ├─ docker/   # Docker installieren, Dienst aktivieren, User in docker-Gruppe
   ├─ k3s/      # k3s installieren, kubeconfig nach ~/.kube/config, kubectl testen
   ├─ helm/     # Helm installieren + Version prüfen
   └─ security/ # UFW: SSH/HTTP/HTTPS erlauben (6443 optional), dann aktivieren
```

## Voraussetzungen (lokal)

- `ansible` installiert.
- Collection für UFW/Zeitzone:
  ```bash
  ansible-galaxy collection install community.general
  ```

## Benutzung (später, bewusst)

1. **Inventory anlegen** (Vorlage kopieren):
   ```bash
   cd ansible
   cp inventory.example.ini inventory.ini
   ```
2. **EC2-IP eintragen** in `inventory.ini` (die `compute_public_ip` aus dem Terraform-Output),
   z. B.:
   ```ini
   [k3s]
   203.0.113.10 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_ed25519
   ```
3. **Erreichbarkeit prüfen** (optional):
   ```bash
   ansible -i inventory.ini k3s -m ping
   ```
4. **Playbook ausführen:**
   ```bash
   ansible-playbook -i inventory.ini playbooks/site.yml     # alles
   ansible-playbook -i inventory.ini playbooks/k3s.yml      # nur k3s + helm
   ```

> Tipp: `--syntax-check` und `--check` (Dry-Run) zum gefahrlosen Testen, bevor echt provisioniert wird.

## 🔐 Sicherheit / Secrets

- **`inventory.ini` wird NICHT committet** (steht in der `.gitignore`) – sie enthält Host-IP
  und ggf. Pfade zu deinem privaten SSH-Key.
- **Niemals** private SSH-Keys oder andere Secrets ins Repo legen.
- Die `security`-Rolle erlaubt **SSH zuerst** und aktiviert UFW erst danach – so sperrt sich
  die Firewall nicht selbst aus. Die Kubernetes-API (6443) wird **nur** geöffnet, wenn
  `ufw_allow_k8s_api=true` gesetzt ist.

## ⚠️ Hinweis

Aktuell ist das reine Vorbereitung. Es werden **keine** Server kontaktiert oder verändert,
solange du nicht selbst `ansible-playbook` ausführst.
