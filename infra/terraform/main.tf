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

# Compute-Modul: kleine EC2-Instanz für k3s.
# Erzeugt NUR etwas, wenn enable_compute = true (Standard: false) → standardmäßig keine Kosten.
module "compute" {
  source = "./modules/compute"

  name_prefix                 = local.name_prefix
  enable_compute              = var.enable_compute
  instance_type               = var.instance_type
  root_volume_size            = var.root_volume_size
  vpc_id                      = module.network.vpc_id
  public_subnet_id            = module.network.public_subnet_ids[0]
  allowed_ssh_cidr            = var.allowed_ssh_cidr
  allowed_kubernetes_api_cidr = var.allowed_kubernetes_api_cidr
  public_key                  = var.public_key
  ssh_public_key_path         = var.ssh_public_key_path
  tags                        = local.common_tags
}

# ECR-Modul: Container-Registry für die App-Images.
# Erzeugt NUR etwas, wenn enable_ecr = true (Standard: false) → standardmäßig keine Kosten.
module "ecr" {
  source = "./modules/ecr"

  name_prefix = local.name_prefix
  enable_ecr  = var.enable_ecr
  tags        = local.common_tags
}

# Weitere Module (RDS, ALB ...) folgen in späteren Abschnitten und werden über die
# jeweiligen enable_*-Toggles gesteuert, z. B.:
#
# module "rds" {
#   source = "./modules/rds"
#   count  = var.enable_rds ? 1 : 0
#   ...
# }
