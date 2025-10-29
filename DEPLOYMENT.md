# PELBIOT Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker (v20+)
- Docker Compose (v1.29+)
- 4GB RAM minimum
- 10GB free disk space

### Local Development

1. **Clone and setup**
```bash
git clone <repository>
cd pelbiot
cp .env.example .env
```

2. **Edit .env** (optional for defaults)
```bash
nano .env
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Access application**
- Frontend: http://localhost
- PhpMyAdmin: http://localhost:8080
- API: http://localhost/api

### Default Credentials
- **Super Admin**: superadmin / superadmin123
- **Admin**: admin / admin123
- **Database**: pelbiot / pelbiot_password
- **phpMyAdmin**: pelbiot / pelbiot_password

## Production Deployment

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /home/ubuntu/pelbiot
cd /home/ubuntu/pelbiot
```

### 2. Configure Environment

```bash
# Copy files from repository
scp -r . user@server:/home/ubuntu/pelbiot/

# Configure environment variables
ssh user@server
cd /home/ubuntu/pelbiot
cp .env.example .env

# Edit .env with production values
sudo nano .env
```

Key production settings:
```env
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
MYSQL_ROOT_PASSWORD=<strong-password>
MYSQL_PASSWORD=<strong-password>
ALLOWED_ORIGINS=your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 3. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf with SSL settings
sudo nano default.conf

# Add to server block:
# listen 443 ssl http2;
# ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

### 4. Start Application

```bash
# Start Docker Compose
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Setup Auto-renewal

```bash
# Create renewal script
cat << 'EOF' > /home/ubuntu/pelbiot/renew-cert.sh
#!/bin/bash
cd /home/ubuntu/pelbiot
certbot renew --quiet
docker-compose restart frontend
EOF

chmod +x /home/ubuntu/pelbiot/renew-cert.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/ubuntu/pelbiot/renew-cert.sh
```

## Database Management

### Backup Database

```bash
# Manual backup
docker-compose exec mysql mysqldump -u pelbiot -ppelbiot_password pelbiot > backup.sql

# Scheduled backup (daily)
cat << 'EOF' > /home/ubuntu/pelbiot/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u pelbiot -ppelbiot_password pelbiot > backups/pelbiot_$DATE.sql
find backups -name "*.sql" -mtime +30 -delete  # Keep 30 days
EOF

chmod +x /home/ubuntu/pelbiot/backup.sh

# Add to crontab
crontab -e
# Add: 0 3 * * * /home/ubuntu/pelbiot/backup.sh
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T mysql mysql -u pelbiot -ppelbiot_password pelbiot < backup.sql
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose ps

# Check individual service logs
docker-compose logs backend
docker-compose logs mysql
docker-compose logs frontend

# Real-time monitoring
docker stats
```

### Common Commands

```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Update services
docker-compose pull
docker-compose up -d

# Clean up
docker-compose down -v  # Also remove volumes
docker system prune -a  # Remove unused images
```

### Performance Optimization

1. **MySQL Optimization**
```sql
-- Optimize tables
OPTIMIZE TABLE devices, panels, transformers, alerts, trends;

-- Add indexes for common queries
CREATE INDEX idx_device_status ON devices(status);
CREATE INDEX idx_alert_severity ON alerts(severity);
```

2. **nginx Caching**
- Static assets cached for 1 year
- API responses cached with proper headers
- Gzip compression enabled

3. **Database**
- Connection pooling configured
- Query optimization with proper indexes
- Regular backups automated

## Troubleshooting

### Services won't start
```bash
# Check docker daemon
sudo systemctl status docker

# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Database connection issues
```bash
# Test connection
docker-compose exec mysql mysql -u pelbiot -ppelbiot_password -e "SELECT 1"

# Check MySQL logs
docker-compose logs mysql

# Reinitialize database
docker-compose down -v
docker-compose up -d
```

### High disk usage
```bash
# Cleanup Docker
docker system prune -a
docker volume prune

# Check application logs size
du -sh ./logs

# Rotate logs
docker-compose exec backend truncate -s 0 logs/*.log
```

## Scaling & Load Balancing

For production deployments with multiple instances:

1. **Use Docker Swarm or Kubernetes**
2. **Setup load balancer** (nginx, HAProxy)
3. **Use external database** (RDS, managed MySQL)
4. **Configure session storage** (Redis, Memcached)

See `kubernetes/` directory for K8s deployment files.

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Setup regular backups
- [ ] Monitor logs
- [ ] Keep Docker updated
- [ ] Use strong JWT_SECRET
- [ ] Enable rate limiting
- [ ] Setup monitoring alerts
- [ ] Regular security patches

## Support

For issues and support:
- Check logs: `docker-compose logs -f`
- Review documentation: `docs/`
- Create GitHub issue with logs and configuration
