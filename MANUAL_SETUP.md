# 🚀 Manual Setup Guide - PELBIOT

If the automated setup script doesn't work, follow these steps manually.

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Docker Compose (comes with Docker Desktop)
- ✅ Node.js 18+ (optional, for local development)

## Step 1: Start Docker Desktop

1. Click **Windows Start Menu**
2. Search for **"Docker Desktop"**
3. Click to launch it
4. Wait for Docker to fully start (check system tray for Docker icon)

## Step 2: Create .env File

Copy `.env.example` to `.env`:

```bash
cd d:\PROJECT\PT\pelbiot
copy .env.example .env
```

Or manually create `.env` with these contents:

```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=pelbiot
DB_PASSWORD=pelbiot_password
DB_NAME=pelbiot_db

# Backend Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Frontend Configuration
REACT_APP_API_URL=http://localhost/api

# CORS
CORS_ORIGIN=http://localhost

# Optional: SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@pelbiot.com
```

## Step 3: Start Docker Containers

Run docker-compose to start all services:

```bash
docker-compose up -d
```

**Wait for containers to start (1-2 minutes)**

## Step 4: Verify Services Are Running

Check container status:

```bash
docker-compose ps
```

You should see 4 containers:
- ✅ mysql (healthy)
- ✅ pelbiot-backend (healthy)
- ✅ pelbiot-frontend (healthy)
- ⚠️ phpmyadmin (optional)

## Step 5: Access the Application

Open your browser and navigate to:

### Frontend Application
```
http://localhost
```

### API Documentation
```
http://localhost/api/health
```

### Database Management (phpMyAdmin)
```
http://localhost:8080
```

## Step 6: Login Credentials

### Super Admin Account
- **Username:** superadmin
- **Password:** superadmin123
- **Role:** Full system access

### Admin Account
- **Username:** admin
- **Password:** admin123
- **Role:** User and settings management

### Database Access (phpMyAdmin)
- **Username:** pelbiot
- **Password:** pelbiot_password
- **Server:** mysql

## 🎯 Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f pelbiot-backend
docker-compose logs -f pelbiot-frontend
docker-compose logs -f mysql
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Data (Warning: Deletes database)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Services
```bash
docker-compose up -d --build
```

### View Container Details
```bash
docker-compose ps -a
```

### Execute Command in Container
```bash
# Backend shell
docker-compose exec pelbiot-backend sh

# MySQL shell
docker-compose exec mysql mysql -u pelbiot -p pelbiot_password pelbiot_db

# Frontend shell
docker-compose exec pelbiot-frontend sh
```

## 🐛 Troubleshooting

### "Docker daemon is not running"
**Solution:** Start Docker Desktop from Windows Start menu and wait for it to fully load.

### "Cannot connect to port 3306"
**Solution:** MySQL container might not be ready. Wait 30 seconds and try again.

### "Database connection failed"
**Solution:** Check if mysql container is running:
```bash
docker-compose logs mysql
```

### "Frontend shows blank page"
**Solution:** Clear browser cache and refresh:
- Press `Ctrl+Shift+Delete`
- Clear browsing data
- Refresh the page

### "Port 80 already in use"
**Solution:** Change port in docker-compose.yml:
```yaml
frontend:
  ports:
    - "8080:80"  # Use 8080 instead of 80
```

Then access: http://localhost:8080

### "Port 3306 already in use"
**Solution:** Stop conflicting MySQL:
```bash
# If MySQL running locally
net stop MySQL80  # or your MySQL service name

# Or change port in docker-compose.yml:
mysql:
  ports:
    - "3307:3306"  # Use 3307 instead of 3306
```

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│            Your Computer                    │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │    Docker Desktop (Docker Engine)    │   │
│  ├──────────────────────────────────────┤   │
│  │  ┌──────────────┐ ┌──────────────┐   │   │
│  │  │   MySQL 8.0  │ │   Backend    │   │   │
│  │  │   Port 3306  │ │   Port 5000  │   │   │
│  │  └──────────────┘ └──────────────┘   │   │
│  │  ┌──────────────┐ ┌──────────────┐   │   │
│  │  │  Frontend    │ │  phpMyAdmin  │   │   │
│  │  │   Port 80    │ │  Port 8080   │   │   │
│  │  └──────────────┘ └──────────────┘   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         ↓ Browser Access
┌─────────────────────────────────────────────┐
│          Your Web Browser                   │
├─────────────────────────────────────────────┤
│  http://localhost:80   (Frontend App)       │
│  http://localhost/api  (Backend API)        │
│  http://localhost:8080 (Database UI)        │
└─────────────────────────────────────────────┘
```

## 🚀 Next Steps

1. ✅ Start Docker Desktop
2. ✅ Create .env file
3. ✅ Run `docker-compose up -d`
4. ✅ Wait for services to start
5. ✅ Access http://localhost
6. ✅ Login with superadmin/superadmin123

## 📞 Support

For more help, see:
- `/SETUP.md` - General setup guide
- `/DEPLOYMENT.md` - Production deployment
- `/docs/` - Full documentation

**Good luck! 🎉**
