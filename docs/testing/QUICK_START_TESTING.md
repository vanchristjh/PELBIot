# 🚀 QUICK START - Testing Admin vs Super Admin

## ⚡ 3 STEPS TO TEST

### Step 1: Clear Everything
```
Tekan: Ctrl + Shift + Delete
Pilih: Clear all
Klik: Clear
Reload: http://localhost:3001
```

### Step 2: Test Admin Account
```
Username: admin
Password: admin123
Click: LOGIN
```

✅ Verify:
- Role badge: 👤 Admin (Cyan)
- Navbar: 4 items (no Admin Panel)
- Sidebar: 5 items
- Can't access Admin Panel

### Step 3: Test Super Admin Account
```
Username: superadmin
Password: superadmin123
Click: LOGIN
```

✅ Verify:
- Role badge: 👑 Super Admin (Gold glow)
- Navbar: 5 items (with Admin Panel)
- Sidebar: 10 items
- CAN access Admin Panel

---

## 🔥 IF LOGIN FAILS

Buka Console (F12), paste ini:

```javascript
localStorage.clear();
location.reload();
```

Atau manual initialize:

```javascript
const users = [
  {id:1,username:'admin',password:'admin123',role:'admin',email:'admin@pelbiot.com',name:'Administrator',createdAt:new Date().toISOString()},
  {id:2,username:'superadmin',password:'superadmin123',role:'super_admin',email:'superadmin@pelbiot.com',name:'Super Administrator',createdAt:new Date().toISOString()}
];
localStorage.setItem('users', JSON.stringify(users));
location.reload();
```

---

## 📚 FULL DOCUMENTATION

- **TESTING_ADMIN_SUPERADMIN_COMPLETE.md** - Complete test checklist
- **TROUBLESHOOT_SUPERADMIN_LOGIN.md** - All troubleshooting steps
- **ADMIN_SUPERADMIN_QUICKSTART.md** - Quick reference
- **CONSOLE_TEST_LOGIN.js** - Browser console test script

---

**READY TO TEST!** 🎯
