# 🌟 PELBIoT - Real-Time Energy Monitoring System

> **Production-Ready | 100% Real-Time Data | Enterprise-Grade Architecture**

A comprehensive real-time energy monitoring and management platform built with **React** and **Node.js**, featuring live database-driven data, WebSocket real-time updates, and role-based access control.

---

## ⚡ Key Features

✅ **Real-Time Monitoring** - 2-second live data updates via WebSocket  
✅ **100% Live Data** - All metrics directly from MySQL database  
✅ **Multi-Role System** - Super Admin, Admin, Moderator roles  
✅ **Interactive Dashboards** - Recharts visualization with real-time updates  
✅ **Comprehensive Alerts** - Real-time notification system  
✅ **Enterprise Security** - JWT authentication & role-based access control  
✅ **Scalable Architecture** - Database-driven, optimized queries  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn  
- MySQL 5.7+
- Git

### First Time Setup
```bash
# 1. Clone and install
git clone <repository-url>
cd pelbiot
npm install

# 2. Setup backend
cd backend
npm install

# 3. Configure database
mysql -u root -p < backend/init.sql

# 4. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 5. Start backend (Terminal 1)
npm start

# 6. Start frontend (Terminal 2)
cd ..
npm start
```

**The app will open at:** `http://localhost:3000`

👉 **Need detailed setup?** → [Setup Guide](./docs/setup/README.md)

---

## 📚 Documentation Hub

**Welcome!** Start here to find what you need:

### 🎯 By Role

| Role | Get Started | Key Resources |
|------|-------------|---------------|
| **Developer** | [Development Setup](./docs/setup/README.md) | [Architecture](./docs/architecture/README.md), [API](./docs/api/README.md) |
| **Administrator** | [Admin Guide](./docs/admin/README.md) | [User Management](./docs/admin/README.md), [Troubleshooting](./docs/troubleshooting/README.md) |
| **Tester** | [Testing Guide](./docs/testing/README.md) | [Test Accounts](./docs/testing/README.md), [Features](./docs/features/README.md) |
| **DevOps** | [Deployment Guide](./docs/deployment/README.md) | [Architecture](./docs/architecture/README.md), [Troubleshooting](./docs/troubleshooting/README.md) |

### 📂 By Topic

| Topic | Purpose | Location |
|-------|---------|----------|
| **🔧 Setup & Installation** | Install and configure system | [docs/setup/](./docs/setup/) |
| **🏗️ Architecture** | System design and architecture | [docs/architecture/](./docs/architecture/) |
| **✨ Features** | Feature documentation | [docs/features/](./docs/features/) |
| **🔌 API Reference** | REST & WebSocket endpoints | [docs/api/](./docs/api/) |
| **👤 Admin System** | User management & roles | [docs/admin/](./docs/admin/) |
| **🔄 Real-Time Implementation** | Real-time data system | [docs/realtime/](./docs/realtime/) |
| **🚀 Deployment** | Production deployment | [docs/deployment/](./docs/deployment/) |
| **🧪 Testing** | Testing & QA | [docs/testing/](./docs/testing/) |
| **❓ Troubleshooting** | Common issues & solutions | [docs/troubleshooting/](./docs/troubleshooting/) |
| **📖 Navigation Guide** | How to find documentation | [docs/guides/](./docs/guides/) |

### 🆕 Latest Updates

**Real-Time Implementation Complete** ✨
- [Project Delivery Summary](./docs/realtime/00_PROJECT_DELIVERY_SUMMARY.md)
- [Implementation Status Report](./docs/realtime/FINAL_STATUS_REPORT.md)
- [Before & After Comparison](./docs/realtime/BEFORE_AND_AFTER.md)

---

## �️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│            Frontend (React 18+)                         │
│  Dashboard │ Panels │ Trafo │ Master Data │ Reports    │
└─────────────────────┬───────────────────────────────────┘
                      │
           Socket.IO (Real-Time)
           REST API (HTTP)
                      │
┌─────────────────────┴───────────────────────────────────┐
│            Backend (Node.js/Express)                    │
│  Controllers │ Services │ Routes │ Middleware           │
└─────────────────────┬───────────────────────────────────┘
                      │
              SQL Queries (Live)
                      │
        ┌─────────────────────────┐
        │   MySQL Database        │
        │ Real Production Data    │
        └─────────────────────────┘
```

---

## 📁 Project Structure

```
pelbiot/
├── src/                      ← Frontend React app
│   ├── components/          (React components)
│   ├── pages/              (Page components)
│   ├── services/           (API & WebSocket)
│   └── App.js              (Main component)
│
├── backend/                  ← Node.js/Express server
│   ├── controllers/         (Request handlers)
│   ├── routes/             (API endpoints)
│   ├── utils/              (Database, helpers)
│   └── server.js           (Express server)
│
├── docs/                     ← 📚 ALL DOCUMENTATION (11 folders)
│   ├── setup/              (Installation & setup)
│   ├── architecture/       (System design)
│   ├── features/           (Feature docs)
│   ├── api/                (API reference)
│   ├── admin/              (Admin guides)
│   ├── realtime/           (Real-time system)
│   ├── deployment/         (Production setup)
│   ├── testing/            (Test guides)
│   ├── troubleshooting/    (Common issues)
│   ├── guides/             (Navigation & guides)
│   └── archive/            (Legacy docs)
│
├── public/                   ← Static files
├── package.json             ← Frontend dependencies
├── README.md               ← You are here
└── .env.example            ← Configuration template
```

---

## 🧪 Test the Application

### Test Credentials

**Super Admin Account:**
```
Email: superadmin@test.com
Password: Test@123
```

**Admin Account:**
```
Email: admin@test.com
Password: Test@123
```

**Moderator Account:**
```
Email: moderator@test.com
Password: Test@123
```

👉 **Full testing guide:** [Testing Documentation](./docs/testing/README.md)

---

## 📊 Application Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend | ✅ Ready | All 13 Socket.IO handlers real-time |
| Frontend | ✅ Ready | 8 pages with live data |
| Database | ✅ Ready | MySQL with real data |
| Real-Time | ✅ Ready | 2-second updates via WebSocket |
| Authentication | ✅ Ready | JWT with 3 roles |
| Testing | ✅ Ready | Test accounts & data available |
| Lint | ✅ Clean | 0 errors |

---

## 🔗 Quick Links

- 📖 **Documentation:** [Full Docs](./docs/README.md) 
- 🚀 **Getting Started:** [Setup Guide](./docs/setup/README.md)
- 🔌 **API Docs:** [API Reference](./docs/api/README.md)
- 🏗️ **Architecture:** [System Design](./docs/architecture/README.md)
- 💻 **Features:** [Feature Docs](./docs/features/README.md)
- 👤 **Admin:** [Admin Guide](./docs/admin/README.md)
- ✨ **Real-Time:** [Real-Time Docs](./docs/realtime/README.md)
- 🧪 **Testing:** [Test Guide](./docs/testing/README.md)
- ❓ **Issues:** [Troubleshooting](./docs/troubleshooting/README.md)
- 📋 **Navigation:** [Navigation Guide](./docs/guides/README.md)

---

## 💡 Popular Questions

**Q: How do I login?**  
A: Use one of the test accounts above. See [Testing Guide](./docs/testing/README.md)

**Q: Where's the API documentation?**  
A: [docs/api/](./docs/api/README.md)

**Q: How does the real-time system work?**  
A: [docs/realtime/](./docs/realtime/README.md)

**Q: How do I deploy to production?**  
A: [docs/deployment/](./docs/deployment/README.md)

**Q: I'm having an issue...**  
A: Check [docs/troubleshooting/](./docs/troubleshooting/README.md)

---

## 📞 Support

- 📚 **Documentation:** [docs/](./docs/)
- 🐛 **Found a bug?** Check [Troubleshooting](./docs/troubleshooting/README.md)
- ❓ **Have a question?** See [Navigation Guide](./docs/guides/NAVIGATION_GUIDE.md)
- 📝 **Need a guide?** Browse [guides/](./docs/guides/)
│   ├── deployment/
│   ├── testing/
│   └── legacy/          (archived)
│
├── src/                 ← Frontend (React)
├── backend/             ← Backend (Node.js/Express)
├── public/              ← Static assets
└── build/               ← Production build
```

## 🌐 Features

✅ Real-time energy monitoring & analytics  
✅ Multi-page dashboard system  
✅ Admin & SuperAdmin roles  
✅ Weather station integration  
✅ Advanced reporting & load profiling  
✅ Equipment monitoring (panels, transformers)  
✅ Socket.IO real-time data streaming  

## 🚀 Running the Application

```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
npm start
```

Application opens at: http://localhost:3000

## 📞 Need Help?

- 📖 **Documentation**: [Browse Docs](./docs/)
- 🆘 **Issues**: Check [Troubleshooting](./docs/troubleshooting/)
- 📊 **Features**: See [Features Guide](./docs/features/)
- 🧪 **Testing**: See [Testing Guide](./docs/testing/)

## 📝 Project Status

✅ **Status**: Production Ready  
✅ **Last Updated**: 29 Oktober 2025  
✅ **Documentation**: Organized & Complete  

---

**👉 [Explore Full Documentation](./docs/)** to get started!

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
