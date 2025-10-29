# 🚀 PELBIOT - Complete Setup & Deployment Guide

## 📋 Overview

PELBIOT is a comprehensive real-time electrical monitoring system with the following critical features:

### ✅ Features Implemented

#### 1. **Security Enhancement** ✨
- ✓ Express Validator for input validation
- ✓ Rate limiting on sensitive endpoints
- ✓ Helmet.js for security headers
- ✓ CORS configuration with whitelist
- ✓ bcryptjs for password hashing
- ✓ JWT token authentication
- ✓ Input sanitization (XSS prevention)

#### 2. **Admin Management UI** 👑
- ✓ Comprehensive admin dashboard
- ✓ User management (CRUD operations)
- ✓ Settings management system
- ✓ Audit logging
- ✓ System monitoring & health checks
- ✓ Activity logs tracking
- ✓ Real-time statistics
- ✓ Role-based access control

#### 3. **Automated Testing** 🧪
- ✓ Jest configuration for backend
- ✓ Unit tests for utilities
- ✓ Integration tests for API endpoints
- ✓ Input validation tests
- ✓ Security middleware tests
- ✓ Test coverage tracking
- ✓ Continuous integration ready

#### 4. **Deployment Setup** 🐳
- ✓ Dockerfile for backend (Node.js)
- ✓ Dockerfile for frontend (nginx)
- ✓ docker-compose.yml with all services
- ✓ GitHub Actions CI/CD pipeline
- ✓ Environment configuration system
- ✓ nginx configuration with caching
- ✓ Database backup automation
- ✓ SSL/TLS ready

---

## 🚀 Quick Start

### For Windows Users

1. **Prerequisites**
   - Docker Desktop for Windows (with WSL 2 enabled)
   - 4GB RAM minimum
   - 10GB free disk space

2. **Setup**
   ```bash
   # Navigate to project directory
   cd pelbiot
   
   # Run setup script
   ./setup.bat
   ```

3. **Access Application**
   - Frontend: http://localhost
   - Database: http://localhost:8080 (phpMyAdmin)
   - API: http://localhost/api

### For Linux/Mac Users

1. **Prerequisites**
   - Docker and Docker Compose installed
   - 4GB RAM minimum
   - 10GB free disk space

2. **Setup**
   ```bash
   cd pelbiot
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Access Application**
   - Frontend: http://localhost
   - Database: http://localhost:8080 (phpMyAdmin)
   - API: http://localhost/api

---

## 📝 Configuration

### Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DATABASE_HOST=mysql
DATABASE_NAME=pelbiot
DATABASE_USER=pelbiot
DATABASE_PASSWORD=pelbiot_password

# Frontend
REACT_APP_API_URL=http://localhost/api
REACT_APP_SOCKET_URL=http://localhost

# Security
JWT_SECRET=your-secret-key-here
```

---

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | superadmin | superadmin123 |
| Admin | admin | admin123 |
| Database | pelbiot | pelbiot_password |

**⚠️ Change these credentials in production!**

---

## 📊 Features in Detail

### 1. Security Enhancement

**Input Validation**
- All API inputs validated using express-validator
- Type checking for numbers, strings, emails
- Length validation and range checks
- Custom regex patterns for specific formats

**Rate Limiting**
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Specific endpoints: 50 requests per minute

**Password Security**
- 8+ characters required
- Must contain uppercase, lowercase, numbers, special chars
- Bcryptjs hashing with salt rounds
- JWT token expiration (24 hours)

**CORS Protection**
- Whitelist-based origin validation
- Credential handling
- Method restrictions (GET, POST, PUT, DELETE)

### 2. Admin Management UI

**User Management**
```
/admin/users
- List all users with pagination
- Create new users
- Update user details
- Delete users (except self)
- Reset user passwords
- Filter by role
```

**Settings Management**
```
/admin/settings
- View all system settings
- Update configuration values
- Setting type support (string, number, boolean, JSON)
```

**System Monitoring**
```
/admin/monitoring
- Real-time uptime display
- Memory usage tracking
- CPU usage metrics
- Device status overview
- Activity log viewing
```

**Audit Logs**
```
/admin/audit-logs
- Track all user actions
- Log successful and failed attempts
- IP address recording
- Timestamp tracking
- Filterable by action type
```

### 3. Automated Testing

**Backend Tests**
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage**
- Authentication utilities: 95%+
- Validation rules: 90%+
- API endpoints: 80%+
- Middleware: 85%+

### 4. Deployment

**Docker Services**
- **mysql**: Database (port 3306)
- **backend**: Node.js API (port 5000)
- **frontend**: React app via nginx (port 80)
- **phpmyadmin**: Database management (port 8080)

**Orchestration**
- docker-compose for local development
- GitHub Actions for CI/CD
- Kubernetes ready (configuration available)

---

## 🛠️ Common Tasks

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### Database Operations
```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u pelbiot -ppelbiot_password pelbiot

# Backup database
docker-compose exec mysql mysqldump -u pelbiot -ppelbiot_password pelbiot > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u pelbiot -ppelbiot_password pelbiot < backup.sql
```

### Service Management
```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Update and restart
docker-compose pull
docker-compose up -d

# View status
docker-compose ps

# Remove everything (including data!)
docker-compose down -v
```

---

## 🚨 Troubleshooting

### Services won't start
```bash
# Check Docker daemon
docker ps

# View detailed logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

### Database connection error
```bash
# Verify MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
docker-compose exec mysql mysql -u pelbiot -ppelbiot_password -e "SELECT 1"
```

### Port already in use
```bash
# Find what's using the port (Linux/Mac)
lsof -i :3306  # or 5000, 80, 8080

# Change port in docker-compose.yml
# Or stop the conflicting service
```

### Frontend blank page
```bash
# Rebuild frontend
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check browser console for errors
# Press F12 in browser
```

---

## 📚 Additional Documentation

For more detailed information, see:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[TESTING.md](./backend/TESTING.md)** - Testing documentation
- **API Documentation** - OpenAPI/Swagger (coming soon)
- **Admin Guide** - In `/docs/admin/`

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
1. ✓ Runs backend tests
2. ✓ Builds Docker images
3. ✓ Runs security scans
4. ✓ Pushes to Docker Hub (if credentials set)
5. ✓ Deploys to production (if configured)

**To enable deployment**, add these secrets to GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `DEPLOY_KEY`
- `DEPLOY_HOST`
- `DEPLOY_USER`

---

## 📞 Support & Help

### Getting Help
1. Check logs: `docker-compose logs -f`
2. Review documentation in `/docs/`
3. Check troubleshooting section above
4. Create GitHub issue with:
   - Error logs
   - Steps to reproduce
   - Environment details

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit pull request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🎉 You're All Set!

PELBIOT is now configured and ready to use. All 4 critical features are implemented:

✅ Security Enhancement  
✅ Admin Management UI  
✅ Automated Testing  
✅ Deployment Setup  

Start monitoring your electrical system with PELBIOT! 🔌
