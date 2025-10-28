# 🔐 MySQL Password Configuration Helper

## The Problem
The backend cannot connect to MySQL because either:
1. The `pelbiot` database doesn't exist
2. The MySQL root password is incorrect in `.env`

## Step 1: Verify Database Exists

Open MySQL Workbench and check if `pelbiot` database is listed on the left side.

### If it's NOT there:
1. In MySQL Workbench, run:
```sql
CREATE DATABASE pelbiot;
```

2. Then open and execute: `setup_database.sql`

### If it IS there:
Continue to Step 2.

---

## Step 2: Get Your MySQL Root Password

1. Open MySQL Workbench
2. Look at the connection you use - the password is stored there
3. Or, check what password you set during MySQL installation

---

## Step 3: Update the Backend Configuration

Edit `backend/.env` and update the password:

```properties
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here    ← UPDATE THIS LINE
DB_NAME=pelbiot
DB_PORT=3306

# Socket.IO Configuration
SOCKET_PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:5000/api
```

**Example:** If your password is `mysql123`:
```properties
DB_PASSWORD=mysql123
```

**Note:** If you have NO password (empty):
```properties
DB_PASSWORD=
```

---

## Step 4: Test the Connection

After updating `.env`, navigate to backend folder and run:

```powershell
cd backend
npm run seed
```

You should see: ✅ **Database seeded successfully!**

---

## Troubleshooting

### "Access denied for user 'root'"
- Your password in `.env` is wrong
- Check MySQL Workbench connection properties for the correct password

### "Unknown database 'pelbiot'"
- Create the database first in MySQL Workbench
- Run: `CREATE DATABASE pelbiot;`

### "Connection timeout"
- MySQL service might not be running
- Check: Get-Service MySQL80 -Status
- Should show "Running"

### "Can't connect to MySQL server"
- MySQL might be on a different port
- Check the port in MySQL Workbench connection settings
- Update `DB_PORT` in `.env` if needed

---

## Quick Check Commands

Paste these in PowerShell from `backend` folder:

```powershell
# Check current settings
Get-Content .env | Select-String "DB_"

# Verify database exists (after updating password and MySQL connection)
npm run seed
```
