# 🚀 Quick Start Guide - Admin vs Super Admin

## 👑 Super Admin Account

```
Username: superadmin
Password: superadmin123
```

### ✨ Features Available
- ✅ Dashboard lengkap (4 cards + 4 charts)
- ✅ Super Admin Panel (manage users)
- ✅ Navbar dengan "Super Admin Panel" menu
- ✅ 10 sidebar menu items
- ✅ Manage user roles
- ✅ Create new users
- ✅ Delete users
- ✅ View audit logs
- ✅ System settings access

### 🎨 Visual Indicators
- Role Badge: **👑 Super Admin** (Gold)
- Sidebar Header: **👑 SUPER ADMIN** (Gold gradient)
- Admin Panel Header: **👑 Super Admin Control Panel** (Gold)

---

## 👤 Admin Account

```
Username: admin
Password: admin123
```

### 📊 Features Available
- ✅ Dashboard limited (2 cards + 1 chart)
- ✅ View real-time metrics (Tegangan, Arus)
- ✅ Monitor Panel Distribusi
- ✅ Monitor Trafo
- ✅ View Reports & Alarms
- ✅ View Weather Station data

### 🚫 Features NOT Available
- ❌ Super Admin Panel (akan ditolak dengan pesan informasi)
- ❌ Manage users
- ❌ Create new users
- ❌ Delete users
- ❌ View audit logs
- ❌ System settings access
- ❌ Sidebar: Verifiable, Load Profile, WS Live, Master Data, Trend

### 🎨 Visual Indicators
- Role Badge: **👤 Admin** (Cyan)
- Sidebar Header: **👤 ADMIN** (Cyan gradient)
- Dashboard: "Admin Dashboard (Limited View)"

---

## 📋 Sidebar Menu Comparison

### Super Admin (10 items)
1. 📊 Overview
2. ⚙️ Verifiable
3. 🚨 Alarm
4. 📋 Report
5. 📊 Load Profile
6. 🌤️ Weather
7. 📡 WS Live
8. 💾 Master Data
9. 📈 Trend
10. ❓ Tutorial

### Admin (5 items)
1. 📊 Overview
2. 🚨 Alarm
3. 📋 Report
4. 🌤️ Weather
5. ❓ Tutorial

---

## 🧪 Testing Steps

### Test 1: Login as Super Admin
```
1. Open http://localhost:3000
2. Username: superadmin
3. Password: superadmin123
4. Check:
   ✅ Navbar shows "Super Admin Panel"
   ✅ Role badge is gold with crown emoji
   ✅ Dashboard shows 4 cards + 4 charts
   ✅ Admin Panel is accessible
```

### Test 2: Login as Admin
```
1. Logout if already logged in
2. Login:
   - Username: admin
   - Password: admin123
3. Check:
   ✅ Navbar does NOT show "Super Admin Panel"
   ✅ Role badge is cyan with admin emoji
   ✅ Dashboard shows 2 cards + 1 chart only
   ✅ Admin Panel shows "Access Denied" message
   ✅ Sidebar shows only 5 menu items
```

### Test 3: Create New User
```
1. Login as Super Admin
2. Go to Admin Panel
3. Click "+ Tambah User Baru"
4. Fill form:
   - Username: testadmin
   - Password: pass123456
   - Confirm Password: pass123456
   - Role: Admin
5. Click "✓ Daftarkan User"
6. Check: User appears in list
```

### Test 4: Create Super Admin User
```
1. Login as Super Admin
2. Go to Admin Panel
3. Click "+ Tambah User Baru"
4. Fill form:
   - Username: testsuperadmin
   - Password: pass123456
   - Confirm Password: pass123456
   - Role: Super Admin (option appears only for Super Admin)
5. Verify: testsuperadmin can now access Admin Panel
```

---

## 🔧 Troubleshooting

### Issue: Admin can see Admin Panel
**Solution**: Clear browser cache and reload
```
1. Press Ctrl+Shift+Delete
2. Clear all cache
3. Go to http://localhost:3000
4. Try again
```

### Issue: Role badge not showing correct color
**Solution**: Check if CSS file is loaded
```
1. Open DevTools (F12)
2. Check Elements for role-badge class
3. Look for .super-admin or .admin class
4. Check if colors apply correctly
```

### Issue: Dashboard still shows full features for Admin
**Solution**: Restart React app
```bash
npm start
```

---

## 💻 Using Permission System in Code

### Example 1: Check if user is Super Admin
```javascript
import { useRoleCheck } from '../contexts/AuthContext';

function MyComponent() {
  const { isSuperAdmin } = useRoleCheck();
  
  if (isSuperAdmin()) {
    return <SuperAdminFeature />;
  }
  return <AdminFeature />;
}
```

### Example 2: Check specific permission
```javascript
import { useRoleCheck } from '../contexts/AuthContext';

function ManageUsers() {
  const { canManageUsers } = useRoleCheck();
  
  if (!canManageUsers()) {
    return <div>Access Denied</div>;
  }
  
  return <UserManagementPanel />;
}
```

### Example 3: Get all permissions
```javascript
import { useRoleCheck } from '../contexts/AuthContext';

function PermissionDebug() {
  const { getPermissions } = useRoleCheck();
  
  const permissions = getPermissions();
  
  return (
    <div>
      {Object.entries(permissions).map(([key, value]) => (
        <p key={key}>
          {key}: {value ? '✅' : '❌'}
        </p>
      ))}
    </div>
  );
}
```

---

## 📊 Dashboard Features Comparison

### Super Admin Dashboard
| Feature | Available |
|---------|-----------|
| Summary Cards | 4 (Energi, Biaya, Panel, Daya) |
| Real-time Metrics | 3 (Tegangan, Arus, Daya) |
| Power Trend Chart | ✅ Yes |
| Ampere Trend Chart | ✅ Yes |
| Panel Status Chart | ✅ Yes |
| Energy Flow Diagram | ✅ Yes |
| Statistics Table | ✅ Yes |

### Admin Dashboard
| Feature | Available |
|---------|-----------|
| Summary Cards | 2 (Energi, Daya) |
| Real-time Metrics | 2 (Tegangan, Arus) |
| Power Trend Chart | ✅ Yes |
| Ampere Trend Chart | ❌ No |
| Panel Status Chart | ❌ No |
| Energy Flow Diagram | ❌ No |
| Statistics Table | ❌ No |

---

## 🎯 Summary

| Aspect | Admin | Super Admin |
|--------|-------|-----------|
| **Username** | admin | superadmin |
| **Password** | admin123 | superadmin123 |
| **Access Level** | Limited | Full |
| **Admin Panel** | ❌ Denied | ✅ Full Access |
| **User Management** | ❌ No | ✅ Yes |
| **Dashboard** | Limited | Full Featured |
| **Sidebar Items** | 5 | 10 |
| **Color Badge** | Cyan | Gold |

✅ **System is ready for use!**
