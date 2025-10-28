# ✅ TESTING GUIDE - Admin vs Super Admin Differentiation

## 🎯 OBJECTIVE
Verify bahwa Admin dan Super Admin memiliki tampilan dan fitur yang berbeda sesuai rencana.

---

## 🚀 QUICK START

### 1. Refresh Browser & Clear Cache
```
Tekan: Ctrl + Shift + Delete
Pilih: Clear all
Klik: Clear
```

### 2. Reload Application
```
URL: http://localhost:3001
Tekan: Ctrl + F5 (hard refresh)
```

### 3. Open Browser Console
```
Tekan: F12
Paste ini untuk verify users:
```javascript
const users = JSON.parse(localStorage.getItem('users'));
users.forEach(u => console.log(`${u.username}: ${u.role}`));
```

---

## 📋 TEST PLAN

### PART 1: ADMIN ACCOUNT TEST
Login dengan: **admin / admin123**

#### Visual Checks:
- [ ] Role badge menunjukkan: **👤 Admin** (warna CYAN #00d4ff)
- [ ] Navbar menunjukkan 4 menu items (Home, Dashboard, Reports, User Management)
  - [ ] ❌ "Super Admin Panel" TIDAK ada di navbar
- [ ] Sidebar menunjukkan 5 menu items:
  - [ ] 📊 Dashboard
  - [ ] 📈 Analytics
  - [ ] 🏠 Resources
  - [ ] 👥 Team
  - [ ] ⚙️ Settings
- [ ] Dashboard header: Warna CYAN (bukan gold)
- [ ] Sidebar header: "👤 ADMIN" (bukan 👑 SUPER ADMIN)

#### Functional Checks:
- [ ] Klik "Super Admin Panel" di Navbar → Akses ditolak (Access Denied)
  - [ ] Error message: "Hanya Super Admin yang dapat mengakses fitur ini"
  - [ ] Informasi tips: "Hubungi Super Administrator untuk akses"
- [ ] Dashboard menampilkan:
  - [ ] 2 cards (System Status, Active Users)
  - [ ] 1 chart saja
  - [ ] 2 metrics
  - [ ] ❌ NOT 4 cards seperti Super Admin

#### Expected Appearance:
```
┌─────────────────────────────────┐
│ 👤 ADMIN          LOGOUT        │ ← Cyan badge
├─────────────────────────────────┤
│ Navigation:                     │
│ Home | Dashboard | Reports | User Mng │
│ (NO Super Admin Panel)          │
├─────────────────────────────────┤
│ Sidebar (5 items)   Dashboard   │
│ ✓ Dashboard         📊 Stats    │
│ ✓ Analytics         (2 Cards)   │
│ ✓ Resources         📈 Chart(1) │
│ ✓ Team              Stats(2)    │
│ ✓ Settings          └─────────  │
└─────────────────────────────────┘
```

---

### PART 2: SUPER ADMIN ACCOUNT TEST
Logout dulu, Login dengan: **superadmin / superadmin123**

#### Visual Checks:
- [ ] Role badge menunjukkan: **👑 Super Admin** (warna GOLD #ffd700 dengan glow)
- [ ] Navbar menunjukkan 5 menu items (Home, Dashboard, Reports, User Management, **Super Admin Panel**)
  - [ ] ✅ "Super Admin Panel" ADA dan BISA diklik
- [ ] Sidebar menunjukkan 10 menu items (BANYAK):
  - [ ] 📊 Dashboard
  - [ ] 📈 Analytics
  - [ ] 🏠 Resources
  - [ ] 👥 Team
  - [ ] ⚙️ Settings
  - [ ] 👑 Admin Panel ← TAMBAHAN (tidak ada di Admin)
  - [ ] 🔧 System Config
  - [ ] 🔐 Security Settings
  - [ ] 📊 Reports Manager
  - [ ] 🗑️ Maintenance
- [ ] Dashboard header: Warna GOLD (tidak cyan)
- [ ] Sidebar header: "👑 SUPER ADMIN" (dengan emoji crown)

#### Functional Checks:
- [ ] Klik "Super Admin Panel" → BISA AKSES
  - [ ] Header: "👑 Super Admin Control Panel"
  - [ ] Bisa lihat user management features
  - [ ] Bisa lihat create/edit/delete user options
- [ ] Dashboard menampilkan:
  - [ ] 4 cards (System Status, Active Users, Performance, Security)
  - [ ] 4 charts (lebih lengkap dari Admin)
  - [ ] 3 metrics
  - [ ] ✅ Lebih detail dan comprehensive

#### Expected Appearance:
```
┌─────────────────────────────────┐
│ 👑 Super Admin (✨glow) LOGOUT  │ ← Gold badge with glow
├─────────────────────────────────┤
│ Navigation:                     │
│ Home | Dashboard | Reports | User | Panel │
│ (ADA Super Admin Panel)          │
├─────────────────────────────────┤
│ Sidebar (10 items) Dashboard    │
│ ✓ Dashboard        👑 Stats(4)  │
│ ✓ Analytics        📊 Charts(4) │
│ ✓ Resources        Stats(3)     │
│ ✓ Team             └─────────   │
│ ✓ Settings                      │
│ ✓ Admin Panel ← BARU            │
│ ✓ System Config                 │
│ ✓ Security Settings             │
│ ✓ Reports Manager               │
│ ✓ Maintenance                   │
└─────────────────────────────────┘
```

---

## 🔄 COMPARISON TABLE

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| **Visual Theme** | Cyan (#00d4ff) | Gold (#ffd700) |
| **Badge Icon** | 👤 | 👑 |
| **Badge Glow** | ❌ No | ✅ Yes |
| **Navbar Items** | 4 | 5 |
| **Sidebar Items** | 5 | 10 |
| **Super Admin Panel Access** | ❌ Denied | ✅ Yes |
| **Dashboard Cards** | 2 | 4 |
| **Dashboard Charts** | 1 | 4 |
| **Dashboard Metrics** | 2 | 3 |
| **Can Manage Users** | ❌ No | ✅ Yes |
| **Can Access Admin Panel** | ❌ No | ✅ Yes |
| **System Config Access** | ❌ No | ✅ Yes |
| **Maintenance Access** | ❌ No | ✅ Yes |

---

## 🧪 DETAILED TESTS

### TEST 1: Login Process
```
Scenario: User tries to login as Admin
Expected: Login successful, redirect to /dashboard
Check: Role badge shows "👤 Admin"
Status: ✓ PASS / ✗ FAIL
```

```
Scenario: User tries to login as Super Admin
Expected: Login successful, redirect to /dashboard
Check: Role badge shows "👑 Super Admin" with gold theme
Status: ✓ PASS / ✗ FAIL
```

### TEST 2: Navbar Menu Items

**Admin Account**:
- [ ] Home - ✓ VISIBLE
- [ ] Dashboard - ✓ VISIBLE
- [ ] Reports - ✓ VISIBLE
- [ ] User Management - ✓ VISIBLE
- [ ] Super Admin Panel - ✗ NOT VISIBLE

**Super Admin Account**:
- [ ] Home - ✓ VISIBLE
- [ ] Dashboard - ✓ VISIBLE
- [ ] Reports - ✓ VISIBLE
- [ ] User Management - ✓ VISIBLE
- [ ] Super Admin Panel - ✓ VISIBLE ← PERBEDAAN

### TEST 3: Sidebar Menu Items

**Admin Account (5 items)**:
- [ ] Dashboard - ✓
- [ ] Analytics - ✓
- [ ] Resources - ✓
- [ ] Team - ✓
- [ ] Settings - ✓
- [ ] Admin Panel - ✗ NOT VISIBLE
- [ ] System Config - ✗ NOT VISIBLE
- [ ] Security Settings - ✗ NOT VISIBLE
- [ ] Reports Manager - ✗ NOT VISIBLE
- [ ] Maintenance - ✗ NOT VISIBLE

**Super Admin Account (10 items)**:
- [ ] Dashboard - ✓
- [ ] Analytics - ✓
- [ ] Resources - ✓
- [ ] Team - ✓
- [ ] Settings - ✓
- [ ] Admin Panel - ✓ ← TAMBAHAN
- [ ] System Config - ✓ ← TAMBAHAN
- [ ] Security Settings - ✓ ← TAMBAHAN
- [ ] Reports Manager - ✓ ← TAMBAHAN
- [ ] Maintenance - ✓ ← TAMBAHAN

### TEST 4: Dashboard Content

**Admin Account**:
```
Expected:
- Card 1: System Status
- Card 2: Active Users
- Metric 1: Uptime
- Metric 2: Response Time
- Chart 1: Activity Overview
- NOT showing: Performance, Security cards
```

**Super Admin Account**:
```
Expected:
- Card 1: System Status
- Card 2: Active Users
- Card 3: Performance ← TAMBAHAN
- Card 4: Security ← TAMBAHAN
- Metric 1: Uptime
- Metric 2: Response Time
- Metric 3: CPU Usage ← TAMBAHAN
- Chart 1: Activity Overview
- Chart 2: System Health ← TAMBAHAN
- Chart 3: User Distribution ← TAMBAHAN
- Chart 4: Resource Usage ← TAMBAHAN
```

### TEST 5: Admin Panel Access

**Admin Account**:
```
Action: Click "Super Admin Panel" in navbar
Expected: Access Denied message
Message: "Hanya Super Admin yang dapat mengakses fitur ini"
Status: ✓ PASS / ✗ FAIL
```

**Super Admin Account**:
```
Action: Click "Super Admin Panel" in navbar
Expected: Admin panel page loads
Header: "👑 Super Admin Control Panel"
Content: User management features visible
Status: ✓ PASS / ✗ FAIL
```

### TEST 6: Theme Colors

**Admin Account**:
- [ ] Role badge color: Cyan (#00d4ff)
- [ ] Sidebar header color: Cyan gradient
- [ ] Dashboard header color: Cyan
- [ ] Highlight effects: Subtle, no glow

**Super Admin Account**:
- [ ] Role badge color: Gold (#ffd700)
- [ ] Sidebar header color: Gold gradient
- [ ] Dashboard header color: Gold
- [ ] Highlight effects: Glowing/shadow effects visible
- [ ] Emoji: 👑 Crown symbol

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass (Blocking Issues)
- [ ] Admin login works
- [ ] Super Admin login works
- [ ] Admin cannot access Admin Panel
- [ ] Super Admin can access Admin Panel
- [ ] Navbar shows different items for each role
- [ ] Sidebar shows different items for each role
- [ ] Dashboard shows different content for each role

### Should Pass (Quality Issues)
- [ ] Role badges show correct icons (👤 vs 👑)
- [ ] Colors are correct (Cyan vs Gold)
- [ ] Text labels show correct role names
- [ ] Transitions between pages are smooth
- [ ] No console errors
- [ ] No console warnings

---

## 📊 VERIFICATION CHECKLIST

### Before Testing
- [ ] npm start is running
- [ ] App loads on http://localhost:3001
- [ ] Browser console is open (F12)
- [ ] localStorage has been cleared (Ctrl+Shift+Del)
- [ ] Page has been refreshed (Ctrl+F5)

### During Testing
- [ ] Check console for any error messages
- [ ] Check console for "Login successful" messages
- [ ] Verify role appears correctly on each screen
- [ ] Screenshot each role's dashboard for comparison

### After Testing
- [ ] All checkboxes marked ✓
- [ ] Document any discrepancies
- [ ] Note any console errors
- [ ] Verify both accounts work identically except for permissions

---

## 🐛 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Login fails | Clear localStorage, refresh page, try again |
| Wrong role badge | Check localStorage users, verify role value |
| Navbar items wrong | Check Navbar.js conditional rendering |
| Sidebar items wrong | Check Sidebar.js menu arrays |
| Colors not showing | Check CSS files, verify no CSS cache |
| Admin can access Admin Panel | Check AdminPanel.js isSuperAdmin() check |

---

## 📸 SCREENSHOT LOCATIONS

Document your testing with screenshots:

1. **Admin Account - Navbar**: `Admin_Navbar.png`
2. **Admin Account - Sidebar**: `Admin_Sidebar.png`
3. **Admin Account - Dashboard**: `Admin_Dashboard.png`
4. **Admin Account - Access Denied**: `Admin_AccessDenied.png`
5. **Super Admin - Navbar**: `SuperAdmin_Navbar.png`
6. **Super Admin - Sidebar**: `SuperAdmin_Sidebar.png`
7. **Super Admin - Dashboard**: `SuperAdmin_Dashboard.png`
8. **Super Admin - Admin Panel**: `SuperAdmin_AdminPanel.png`

---

## 🎯 FINAL VERIFICATION

After completing all tests, verify:

```javascript
// In console, check this works for both users:

// For Admin account:
localStorage.getItem('currentUser')
// Should show: {"id":1,"username":"admin","role":"admin",...}

// For Super Admin account:
localStorage.getItem('currentUser')
// Should show: {"id":2,"username":"superadmin","role":"super_admin",...}
```

---

**Testing Complete!** ✅

Once all tests pass, the Admin vs Super Admin differentiation system is fully operational.

For any issues, refer to `TROUBLESHOOT_SUPERADMIN_LOGIN.md`
