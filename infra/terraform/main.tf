# Haupt-Einstiegspunkt.
#
# Bindet das Netzwerk-Modul ein. VPC, Subnetze, IGW und Route Tables sind kostenlos;
# das einzige kostenpflichtige Element (NAT Gateway) bleibt über enable_nat_gateway
# standardmäßig DEAKTIVIERT.
#
# Hinweis: `terraform plan` zeigt jetzt die zu erstellenden Netzwerk-Ressourcen als
# Vorschau an – es wird aber NICHTS erstellt, solange du nicht bewusst `apply` ausführst.

module "network" {
  source = "./modules/network"

  name_prefix          = local.name_prefix
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway   = var.enable_nat_gateway
  tags                 = local.common_tags
}

# Weitere Module (RDS, ALB ...) folgen in späteren Abschnitten und werden über die
# jeweiligen enable_*-Toggles gesteuert, z. B.:
#
# module "rds" {
#   source = "./modules/rds"
#   count  = var.enable_rds ? 1 : 0
#   ...
# }
