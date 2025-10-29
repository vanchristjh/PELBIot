@echo off
REM PELBIOT Setup Script for Windows
REM This script automates the setup process for local environment

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║       PELBIOT Setup Script for Windows                   ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check for Docker
echo 🔍 Checking for Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop for Windows.
    pause
    exit /b 1
)
echo ✅ Docker found

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ .env file created
) else (
    echo ⚠️  .env file already exists
)

echo.
echo 🐳 Starting Docker containers...
docker-compose down --remove-orphans 2>nul
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker containers
    pause
    exit /b 1
)

echo ✅ Docker containers started
echo.

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                    Access Information                    ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║ Frontend:     http://localhost                           ║
echo ║ API:          http://localhost/api                       ║
echo ║ phpMyAdmin:   http://localhost:8080                      ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║                  Default Credentials                     ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║ Super Admin:  superadmin / superadmin123                ║
echo ║ Admin:        admin / admin123                          ║
echo ║ Database:     pelbiot / pelbiot_password                ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 📋 Useful commands:
echo.
echo    View logs:           docker-compose logs -f
echo    Stop services:       docker-compose down
echo    Restart services:    docker-compose restart
echo    View status:         docker-compose ps
echo.

echo ✅ Setup complete! PELBIOT is ready to use.
echo Opening browser in 3 seconds...
timeout /t 3

start http://localhost

pause
