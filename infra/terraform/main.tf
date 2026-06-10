# Haupt-Einstiegspunkt.
#
# In diesem Abschnitt (Grundgerüst) werden BEWUSST noch KEINE Ressourcen erstellt.
# `terraform plan` zeigt daher "No changes." – das ist Absicht und sicher.
#
# Spätere Ressourcen/Module werden hier eingebunden und über die Feature-Toggles
# aus variables.tf gesteuert. Muster (count-Toggle), nur als Beispiel auskommentiert:
#
# module "rds" {
#   source = "./modules/rds"
#   count  = var.enable_rds ? 1 : 0
#   ...
# }
#
# module "load_balancer" {
#   source = "./modules/alb"
#   count  = var.enable_load_balancer ? 1 : 0
#   ...
# }
#
# So bleibt alles Teure standardmäßig aus und wird nur bei bewusstem
# Setzen des jeweiligen Toggles auf true erzeugt.
