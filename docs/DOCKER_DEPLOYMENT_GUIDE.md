# Docker Deployment Guide - PELBIOT

## Overview

PELBIOT uses Docker and Docker Compose for containerized deployment. The setup includes:

- **Backend API** (Node.js + Express)
- **MySQL Database** (MySQL 8.0)
- **Redis Cache** (Redis 7.0)
- **Frontend** (React) - Optional
- **phpMyAdmin** - Optional (debug profile)

## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- At least 4GB RAM available
- Ports 5000 (API), 3306 (MySQL), 6379 (Redis) available

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd pelbiot
cp backend/.env.example backend/.env
```

### 2. Configure Environment Variables

Edit `.env` file with your configuration:

```bash
# Essential variables to customize:
DB_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret_key
SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

### 3. Start Services

```bash
# Start all services (MySQL, Redis, Backend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Verify Health

```bash
# Check API health
curl http://localhost:5000/health

# Check Redis
docker-compose exec redis redis-cli -a your_redis_password ping

# Check MySQL
docker-compose exec mysql mysql -u pelbiot -p -e "SELECT 1;"
```

## Environment Configuration

### Database Variables

```env
DB_HOST=mysql           # Service name
DB_PORT=3306            # Container port
DB_USER=pelbiot         # MySQL user
DB_PASSWORD=pelbiot123  # MySQL password (CHANGE THIS)
DB_NAME=pelbiot         # Database name
```

### Redis Variables

```env
REDIS_HOST=redis        # Service name
REDIS_PORT=6379         # Container port
REDIS_PASSWORD=redis123 # Redis password (CHANGE THIS)
REDIS_DB=0              # Database number
REDIS_TTL=3600          # Default TTL in seconds
```

### Security Variables

```env
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d
SENTRY_DSN=https://key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Rate Limiting & Protection

```env
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # Per window
RATE_LIMIT_DDoS_THRESHOLD=1000       # Per minute

CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_SUCCESS_THRESHOLD=2
CIRCUIT_BREAKER_TIMEOUT_MS=60000
```

## Docker Compose Services

### Backend Service

**Container:** `pelbiot-backend`  
**Image:** Node.js 18-Alpine (built from Dockerfile)  
**Port:** 5000  
**Health Check:** HTTP GET /health (30s interval)

```bash
# View backend logs
docker-compose logs -f backend

# Execute command in backend
docker-compose exec backend npm test

# Restart backend
docker-compose restart backend
```

### MySQL Service

**Container:** `pelbiot-mysql`  
**Image:** MySQL 8.0-Alpine  
**Port:** 3306  
**Health Check:** mysqladmin ping (10s interval)

```bash
# Connect to MySQL
docker-compose exec mysql mysql -u pelbiot -p

# Run SQL file
docker-compose exec mysql mysql -u pelbiot -p < backup.sql

# Backup database
docker-compose exec mysql mysqldump -u pelbiot -p pelbiot > backup.sql
```

### Redis Service

**Container:** `pelbiot-redis`  
**Image:** Redis 7-Alpine  
**Port:** 6379  
**Health Check:** redis-cli ping (10s interval)

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli -a your_redis_password

# Check Redis info
docker-compose exec redis redis-cli -a password info

# Monitor Redis
docker-compose exec redis redis-cli -a password MONITOR
```

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Run Commands in Container

```bash
# Run tests
docker-compose exec backend npm test

# Run seeds
docker-compose exec backend npm run seed

# Install packages
docker-compose exec backend npm install <package>

# Check Node version
docker-compose exec backend node --version
```

### Database Management

```bash
# Access MySQL
docker-compose exec mysql mysql -u pelbiot -p pelbiot

# Create backup
docker-compose exec mysql mysqldump -u pelbiot -p pelbiot > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T mysql mysql -u pelbiot -p pelbiot < backup.sql
```

### Stop and Remove

```bash
# Stop services (data persists)
docker-compose down

# Stop and remove everything
docker-compose down -v

# Stop specific service
docker-compose stop backend

# Restart specific service
docker-compose restart backend
```

## Networking

All services are on the same Docker network (`pelbiot_network`):

- Backend can reach MySQL at: `mysql:3306`
- Backend can reach Redis at: `redis:6379`
- Services can communicate using service names as hostnames

## Volumes

### Persistent Data

- **mysql_data** - MySQL database files
- **redis_data** - Redis persistence data
- **logs** - Application logs

```bash
# View volume information
docker volume inspect pelbiot_mysql_data

# Remove unused volumes
docker volume prune
```

## Production Deployment

### Security Best Practices

1. **Change Default Passwords**
   ```env
   DB_PASSWORD=<strong_password>
   REDIS_PASSWORD=<strong_password>
   JWT_SECRET=<strong_secret>
   ```

2. **Use Environment Files**
   - Never commit `.env` to version control
   - Use `.env.example` for template
   - Keep `.env` in `.gitignore`

3. **Enable Sentry**
   ```env
   SENTRY_DSN=<your_sentry_url>
   SENTRY_ENVIRONMENT=production
   ENABLE_SENTRY_TRACKING=true
   ```

4. **Configure Resource Limits**
   - Backend: 2 CPU, 2GB RAM limit
   - MySQL: Monitor disk usage
   - Redis: Monitor memory usage

### Scaling

```bash
# Scale backend service (Docker Compose doesn't support direct scaling)
# Instead, use Kubernetes or create multiple compose files

# For production, consider Kubernetes:
# - Multiple replicas of backend
# - Load balancing
# - Auto-scaling based on metrics
```

## Debugging

### Access Container Shell

```bash
# Backend shell
docker-compose exec backend /bin/sh

# MySQL shell
docker-compose exec mysql /bin/bash

# Redis shell
docker-compose exec redis /bin/sh
```

### Check Resource Usage

```bash
# View container stats
docker stats

# Specific container
docker stats pelbiot-backend
```

### Network Troubleshooting

```bash
# Test connectivity between containers
docker-compose exec backend ping mysql

# Check DNS resolution
docker-compose exec backend nslookup mysql

# View network info
docker network inspect pelbiot_pelbiot_network
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Restart with rebuild
docker-compose up -d --build backend

# Check database connectivity
docker-compose exec backend curl http://mysql:3306
```

### Database connection fails

```bash
# Verify MySQL is healthy
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

### Redis connection fails

```bash
# Verify Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli -a password ping

# Check Redis logs
docker-compose logs redis
```

## Maintenance

### Regular Backups

```bash
#!/bin/bash
# Create daily backup
docker-compose exec -T mysql mysqldump -u pelbiot -p[password] pelbiot > backups/backup_$(date +%Y%m%d).sql
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Remove old images
docker image prune
```

### Monitor Health

```bash
# Check all health checks
docker-compose ps

# View specific health check
docker inspect pelbiot-backend | grep -A 10 "Health"
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Node.js Docker Hub](https://hub.docker.com/_/node)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Test connectivity between services
4. Review environment configuration
5. Check documentation in `/docs` folder
