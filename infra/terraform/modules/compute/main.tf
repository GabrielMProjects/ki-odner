# Compute-Modul: kleine EC2-Instanz für k3s (wird später per Ansible bespielt).
#
# KOSTENKONTROLLE: Es wird NICHTS erstellt, solange enable_compute = false (Standard).
# Erst enable_compute = true (+ bewusstes `terraform apply`) erzeugt EC2/SG/Key Pair.

locals {
  # SSH-Public-Key entweder direkt (public_key) oder aus Datei (ssh_public_key_path).
  ssh_public_key = (
    var.public_key != "" ? var.public_key :
    (var.ssh_public_key_path != "" ? file(var.ssh_public_key_path) : "")
  )
}

# ─── AMI: aktuelles Ubuntu 22.04 LTS (keine harte AMI-ID) ────────────
data "aws_ami" "ubuntu" {
  count       = var.enable_compute ? 1 : 0
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── Security Group für k3s ──────────────────────────────────────────
resource "aws_security_group" "k3s" {
  count       = var.enable_compute ? 1 : 0
  name        = "${var.name_prefix}-k3s-sg"
  description = "Security group for k3s demo node"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH (nur eingeschraenkter CIDR)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubernetes API (NICHT oeffentlich)"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_kubernetes_api_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-k3s-sg"
  })
}

# ─── Key Pair (nur bei enable_compute) ───────────────────────────────
resource "aws_key_pair" "this" {
  count      = var.enable_compute ? 1 : 0
  key_name   = "${var.name_prefix}-key"
  public_key = local.ssh_public_key

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-key"
  })
}

# ─── IAM-Rolle + Instance-Profile (nur ECR-Pull) ─────────────────────
# Best Practice: die EC2 zieht Images via Rolle – KEINE Access Keys auf der Instanz.
# Alle IAM-Ressourcen sind kostenlos.
data "aws_iam_policy_document" "ec2_assume" {
  count = var.enable_compute ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  count              = var.enable_compute ? 1 : 0
  name               = "${var.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume[0].json
  tags               = var.tags
}

# Nur Lesezugriff auf ECR (Images ziehen) – minimaler Scope.
resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  count      = var.enable_compute ? 1 : 0
  role       = aws_iam_role.ec2[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2" {
  count = var.enable_compute ? 1 : 0
  name  = "${var.name_prefix}-ec2-profile"
  role  = aws_iam_role.ec2[0].name
  tags  = var.tags
}

# ─── EC2-Instanz für k3s ─────────────────────────────────────────────
resource "aws_instance" "k3s" {
  count                       = var.enable_compute ? 1 : 0
  ami                         = data.aws_ami.ubuntu[0].id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.k3s[0].id]
  key_name                    = aws_key_pair.this[0].key_name
  iam_instance_profile        = aws_iam_instance_profile.ec2[0].name

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-k3s"
    Role = "k3s"
  })
}
