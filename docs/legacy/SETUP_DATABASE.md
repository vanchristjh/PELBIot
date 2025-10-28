# 🗄️ Quick Database Setup Guide

MySQL is running on your system! ✅

## Step 1: Open MySQL Command Line

```powershell
mysql -u root -p
```

**Note:** If this doesn't work, try:
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

## Step 2: Enter your MySQL password

You'll be prompted for your password (the one you set during MySQL installation).

## Step 3: Create the Database

Once connected to MySQL, copy and paste these commands one by one:

```sql
CREATE DATABASE pelbiot;
USE pelbiot;
SOURCE backend/database.sql;
SHOW TABLES;
EXIT;
```

**Expected Output:**
- After `CREATE DATABASE`: You should see "Query OK, 1 row affected"
- After `SOURCE database.sql`: Multiple "Query OK" messages
- After `SHOW TABLES`: You should see these 10 tables:
  - alerts
  - devices
  - load_profiles
  - master_data
  - panels
  - reports
  - transformers
  - trends
  - verification
  - weather_stations

## Step 4: Back to PowerShell

Once the database is created, return to this terminal and run:

```powershell
cd D:\PROJECT\PT\pelbiot\backend
npm run seed
```

You should see: ✅ Database seeded successfully!

---

## Troubleshooting

**"Access denied for user 'root'@'localhost'"**
- Your MySQL password is incorrect
- You may need to reset it

**"Can't find file 'database.sql'"**
- Make sure you're running this command FROM the D:\PROJECT\PT\pelbiot folder
- Or use the full path: `SOURCE D:\PROJECT\PT\pelbiot\backend\database.sql;`

**"MySQL command not found"**
- Try using the full path: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p`
- Or add MySQL to your PATH environment variable

---

**Let me know once the database is created and I'll help you complete the setup!**
