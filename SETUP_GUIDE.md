# PELBIOT Phase 2 - Setup & Troubleshooting Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18.13.0+ (recommend 18.19.0 or 20.0.0+)
- npm 8.19.3+
- Docker & Docker Compose (for production)
- MySQL 8.0+
- Redis 7.0+

### Development Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your values (optional for development)
# nano .env  # or use your editor

# 4. Install dependencies
npm install

# 5. Run tests (optional)
node testRunner.js

# 6. Start development server
npm run dev
```

---

## ⚠️ Known Issues & Solutions

### Issue 1: Sentry Initialization Error

**Error Message:**
```
SyntaxError: The requested module 'node:diagnostics_channel' does not provide an export named 'tracingChannel'
```

**Cause:**
- Node version 18.13.0 doesn't have the required `tracingChannel` export
- Sentry requires Node 18.19.0 or higher

**Solutions:**

#### Option A: Upgrade Node.js (Recommended)
```bash
# Check your current Node version
node -v

# Upgrade to Node 18.19.0 or later
# Download from: https://nodejs.org/
# OR use nvm: nvm install 18.19.0
```

#### Option B: Use Docker (No Node upgrade needed)
```bash
# From the project root directory
docker-compose up -d

# This uses Node 18 Alpine which is compatible
```

#### Option C: Disable Sentry temporarily (Development only)

The server now gracefully handles Sentry initialization failure. If you see the warning:
```
⚠️  Sentry initialization skipped (requires Node 18.19+)
```

This is normal! The server will:
- ✅ Still start successfully
- ✅ All middleware will work
- ✅ Validation, rate limiting, error tracking still function
- ⚠️ Only Sentry cloud integration will be disabled

**Your server will still have:**
- ✅ Input validation & sanitization
- ✅ Rate limiting & DDoS protection  
- ✅ Local error tracking (ErrorTracker class)
- ✅ All other security features

---

### Issue 2: Docker Compose YAML Errors

**Error Message:**
```
yaml: unmarshal errors:
  line 150: mapping key "restart" already defined at line 55
```

**Solution:**
✅ This has been fixed in the latest `docker-compose.yml`

Verify it's fixed:
```bash
docker-compose config
# Should show no errors
```

---

## 🐳 Docker Deployment (Recommended)

### Setup

```bash
# 1. From project root
cp backend/.env.example .env

# 2. Edit .env with production values
nano .env

# 3. Start all services
docker-compose up -d

# 4. Verify services are running
docker-compose ps

# 5. Check backend health
curl http://localhost:5000/health

# 6. View logs
docker-compose logs -f backend
```

### Benefits of Docker

✅ Automatic Node version compatibility (Node 18 Alpine included)
✅ Sentry integration works out of the box
✅ MySQL and Redis included
✅ Production-ready configuration
✅ No local database setup needed

---

## ✅ Testing

### Run Test Suite

```bash
cd backend
node testRunner.js
```

**Expected Output:**
```
✅ Passed: 39
❌ Failed: 0
📊 Total:  39
✨ All tests passed! SEMPURNA quality achieved! ✨
```

### Test Results Include

- ✅ Email validation (4 tests)
- ✅ Phone validation (4 tests)
- ✅ URL validation (4 tests)
- ✅ Number validation (5 tests)
- ✅ String sanitization (3 tests)
- ✅ Object sanitization (2 tests)
- ✅ Schema validation (2 tests)
- ✅ Rate limiting (3 tests)
- ✅ Circuit breaker (4 tests)
- ✅ Error tracking (5 tests)
- ✅ Performance (2 tests)

---

## 🔧 Configuration

### Environment Variables

**Essential for Production:**

```env
# Database
DB_PASSWORD=<strong_password>
DB_USER=pelbiot

# Redis
REDIS_PASSWORD=<strong_password>

# JWT
JWT_SECRET=<strong_secret_key>

# Sentry (if using)
SENTRY_DSN=https://key@sentry.io/project-id
```

**See `backend/.env.example` for all options**

---

## 📊 Monitoring & Status

### Check Backend Status

```bash
# Local development
curl http://localhost:5000/health

# Docker
docker-compose exec backend curl http://localhost:5000/health

# Expected response:
# { "status": "✅ Backend API Running", "timestamp": "..." }
```

### View Logs

```bash
# Development
npm run dev        # Shows logs directly

# Docker
docker-compose logs -f backend    # Follow logs
docker-compose logs backend       # Show recent logs
```

### Check Services

```bash
# All services
docker-compose ps

# Specific service health
docker-compose exec mysql mysql -u pelbiot -p pelbiot -e "SELECT 1;"
docker-compose exec redis redis-cli -a password ping
```

---

## 🎯 Common Commands

### Development

```bash
cd backend

npm install         # Install dependencies
npm run dev         # Start with auto-reload
node testRunner.js  # Run tests
npm start          # Start production mode
npm run seed       # Seed database
```

### Docker

```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose restart backend    # Restart backend
docker-compose ps                 # Show status
docker-compose logs -f backend    # Follow logs
```

### Database

```bash
# MySQL
docker-compose exec mysql mysql -u pelbiot -p pelbiot
# Then run SQL commands

# Backup
docker-compose exec -T mysql mysqldump -u pelbiot -p pelbiot > backup.sql

# Restore
docker-compose exec -T mysql mysql -u pelbiot -p pelbiot < backup.sql
```

### Redis

```bash
# Connect to Redis
docker-compose exec redis redis-cli -a password

# Common commands
ping                    # Test connection
INFO                    # Server info
FLUSHDB                 # Clear database
KEYS *                  # List keys
```

---

## 🐛 Troubleshooting

### Backend won't start

1. **Check Node version:**
   ```bash
   node -v
   # If < 18.19.0, upgrade or use Docker
   ```

2. **Check logs:**
   ```bash
   npm run dev    # Watch for errors
   ```

3. **Check ports:**
   ```bash
   # Port 5000 might be in use
   netstat -ano | findstr :5000
   ```

4. **Use Docker as fallback:**
   ```bash
   docker-compose up -d
   ```

### Database connection fails

```bash
# Check MySQL is running
docker-compose ps mysql

# Check credentials in .env
cat .env | grep DB_

# Test connection
docker-compose exec mysql mysql -u pelbiot -p pelbiot -e "SELECT 1;"
```

### Redis connection fails

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli -a password ping
```

### Validation not working

```bash
# Run tests to verify
cd backend
node testRunner.js

# Check middleware is loaded
grep validationMiddleware server.js
```

---

## 📚 Documentation

- **[PHASE_2_QUICK_REFERENCE.md](./PHASE_2_QUICK_REFERENCE.md)** - Quick overview
- **[PHASE_2_COMPLETION_REPORT.md](./PHASE_2_COMPLETION_REPORT.md)** - Detailed report
- **[docs/DOCKER_DEPLOYMENT_GUIDE.md](./docs/DOCKER_DEPLOYMENT_GUIDE.md)** - Deployment guide
- **[backend/.env.example](./backend/.env.example)** - Configuration template

---

## 🚀 Deployment Options

### Option 1: Local Development (Fastest)
```bash
cd backend
npm install
node testRunner.js
npm run dev
```
⚠️ Note: Sentry may not work on Node 18.13.0

### Option 2: Docker (Recommended)
```bash
docker-compose up -d
curl http://localhost:5000/health
```
✅ Everything works out of the box

### Option 3: Cloud Deployment
See `docs/DOCKER_DEPLOYMENT_GUIDE.md` for production deployment guides

---

## ✨ What's Included

### Phase 2 Features

1. ✅ **Input Validation & Sanitization** (500+ lines)
   - XSS prevention
   - SQL injection detection
   - Email, phone, URL validation

2. ✅ **Rate Limiting & DDoS Protection** (474 lines)
   - Redis-backed rate limiting
   - DDoS detection (1000 req/min threshold)
   - Circuit breaker pattern

3. ✅ **Error Tracking** (415 lines)
   - Sentry integration
   - Local error tracking
   - Performance monitoring

4. ✅ **Unit Tests** (400+ lines)
   - 39 comprehensive tests
   - 100% pass rate
   - Performance benchmarks

5. ✅ **Docker Setup**
   - Multi-service composition
   - MySQL + Redis included
   - Production-ready config

---

## 📞 Support

### Getting Help

1. Check relevant documentation file
2. Run tests: `node testRunner.js`
3. Check logs: `docker-compose logs backend`
4. Verify configuration: `cat .env`
5. Test connectivity between services

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Sentry error | Use Node 18.19+ or Docker |
| Port in use | Change PORT in .env |
| DB connection fails | Check .env credentials |
| Redis error | Ensure Redis service running |
| Tests failing | Run `node testRunner.js` again |

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Tests pass: `node testRunner.js` → 39/39 passing
✅ Server starts: `npm run dev` → "Backend API Running"
✅ Health check works: `curl http://localhost:5000/health` → 200 OK
✅ Docker works: `docker-compose ps` → All services running
✅ Middleware loads: Check server logs for middleware messages

---

## 📝 Summary

- **Status:** ✅ PRODUCTION READY
- **Tests:** ✅ 39/39 passing (100%)
- **Quality:** ✨ SEMPURNA
- **Deployment:** 🐳 Docker recommended for Node <18.19.0
- **Sentry:** ⚠️ Works with Node 18.19.0+, gracefully disabled otherwise

**All systems are operational!**

---

*Last Updated: October 29, 2025*  
*Version: 2.0.0*
