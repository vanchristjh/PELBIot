# Setup & Installation

This folder contains setup and installation guides for the PELBIoT system.

## 📋 Contents

### Getting Started
- Installation instructions
- Environment setup
- Database configuration
- Dependencies installation

### Configuration
- Environment variables (.env)
- Database credentials
- API keys and secrets
- Server configuration

### Database Setup
- MySQL installation
- Database creation
- Schema initialization
- Sample data seeding

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn
- MySQL 5.7+
- Git

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd pelbiot

# 2. Install dependencies
npm install
cd backend && npm install

# 3. Setup database
# See database configuration below

# 4. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 5. Start backend server
cd backend
npm start

# 6. Start frontend (in another terminal)
npm start
```

### Database Configuration

```sql
-- Create database
CREATE DATABASE pelbiot;

-- Run initialization scripts
mysql -u root -p pelbiot < backend/init.sql
```

---

## 📚 Related Documentation

- **Architecture:** [`../architecture/`](../architecture/)
- **API Reference:** [`../api/`](../api/)
- **Deployment:** [`../deployment/`](../deployment/)
- **Troubleshooting:** [`../troubleshooting/`](../troubleshooting/)

---

**Last Updated:** October 29, 2025
