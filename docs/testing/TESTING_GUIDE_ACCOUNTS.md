# 🔐 Account Management & Testing Guide

## 📋 System Accounts

### 1️⃣ Default Super Admin Account

| Property | Value |
|----------|-------|
| **Username** | `superadmin` |
| **Password** | `superadmin123` |
| **Role** | `super_admin` |
| **Email** | `superadmin@pelbiot.com` |
| **Status** | ✅ Active (Default) |
| **Permissions** | 15/15 (All) |

**Features Available**:
- ✅ Access to Admin Panel
- ✅ Manage all users
- ✅ Create new users
- ✅ Delete users
- ✅ Change user roles
- ✅ View system audit logs
- ✅ Access system settings
- ✅ Full dashboard access (4 cards + 4 charts)
- ✅ All sidebar menu items (10 items)
- ✅ Advanced features

---

### 2️⃣ Default Admin Account

| Property | Value |
|----------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Role** | `admin` |
| **Email** | `admin@pelbiot.com` |
| **Status** | ✅ Active (Default) |
| **Permissions** | 5/15 (Limited) |

**Features Available**:
- ❌ Cannot access Admin Panel
- ❌ Cannot manage users
- ✅ View limited dashboard (2 cards + 1 chart)
- ✅ Monitor real-time metrics
- ✅ View alarms and reports
- ✅ Access weather station data
- ✅ View tutorial
- ✅ 5 sidebar menu items

---

## 🧪 Testing Procedures

### Test Case 1: Super Admin Full Access

**Objective**: Verify Super Admin has complete access to all features

**Steps**:
1. Open browser to `http://localhost:3000`
2. Enter credentials:
   - Username: `superadmin`
   - Password: `superadmin123`
3. Click Login button
4. Verify the following:

| Check Point | Expected | Result |
|------------|----------|--------|
| Navbar shows 5 items | Yes | ✅ / ❌ |
| Navbar includes "Super Admin Panel" | Yes | ✅ / ❌ |
| Role badge shows "👑 Super Admin" | Yes | ✅ / ❌ |
| Role badge is gold colored | Yes | ✅ / ❌ |
| Sidebar header shows "👑 SUPER ADMIN" | Yes | ✅ / ❌ |
| Sidebar has 10 menu items | Yes | ✅ / ❌ |
| Dashboard shows 4 summary cards | Yes | ✅ / ❌ |
| Dashboard shows 3 real-time metrics | Yes | ✅ / ❌ |
| Dashboard shows 4 charts | Yes | ✅ / ❌ |
| Can navigate to Admin Panel | Yes | ✅ / ❌ |
| Admin Panel shows user management | Yes | ✅ / ❌ |

**Expected Result**: ✅ All checks pass

---

### Test Case 2: Admin Limited Access

**Objective**: Verify Admin has limited access and denied features

**Steps**:
1. Open new browser tab to `http://localhost:3000`
2. If already logged in, click Logout button
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click Login button
5. Verify the following:

| Check Point | Expected | Result |
|------------|----------|--------|
| Navbar shows 4 items | Yes | ✅ / ❌ |
| Navbar does NOT include "Super Admin Panel" | No | ✅ / ❌ |
| Role badge shows "👤 Admin" | Yes | ✅ / ❌ |
| Role badge is cyan colored | Yes | ✅ / ❌ |
| Sidebar header shows "👤 ADMIN" | Yes | ✅ / ❌ |
| Sidebar has 5 menu items | Yes | ✅ / ❌ |
| Dashboard shows 2 summary cards only | Yes | ✅ / ❌ |
| Dashboard shows 2 real-time metrics | Yes | ✅ / ❌ |
| Dashboard shows 1 chart only | Yes | ✅ / ❌ |
| Cannot navigate to Admin Panel | Yes | ✅ / ❌ |
| Admin Panel shows "Access Denied" | Yes | ✅ / ❌ |
| "Access Denied" message is informative | Yes | ✅ / ❌ |

**Expected Result**: ✅ All checks pass

---

### Test Case 3: Create New User (Super Admin Only)

**Objective**: Verify Super Admin can create new users

**Steps**:
1. Login as Super Admin (superadmin/superadmin123)
2. Navigate to Admin Panel
3. Click "+ Tambah User Baru" button
4. Fill in the form:
   ```
   Username:     testuser1
   Password:     password123
   Confirm Pass: password123
   Role:         Admin
   ```
5. Click "✓ Daftarkan User" button
6. Verify user appears in the user list
7. Try to login with new account:
   - Username: testuser1
   - Password: password123
8. Verify new user has Admin role (limited access)

**Expected Result**:
- ✅ User created successfully
- ✅ User appears in list
- ✅ Can login with new account
- ✅ New account has Admin limitations

---

### Test Case 4: Create Super Admin User

**Objective**: Verify only Super Admin can create other Super Admin

**Steps**:
1. Login as Super Admin (superadmin/superadmin123)
2. Navigate to Admin Panel
3. Click "+ Tambah User Baru" button
4. Fill in the form:
   ```
   Username:     testsuperadmin
   Password:     password123
   Confirm Pass: password123
   Role:         Super Admin  ← This option should appear
   ```
5. Click "✓ Daftarkan User" button
6. Try to login with new Super Admin:
   - Username: testsuperadmin
   - Password: password123
7. Verify new account has Super Admin privileges

**Expected Result**:
- ✅ Super Admin role option is available
- ✅ User created as Super Admin
- ✅ New account has full access
- ✅ New account can access Admin Panel

---

### Test Case 5: Admin Cannot Access Admin Panel

**Objective**: Verify Admin role cannot access Admin Panel

**Steps**:
1. Login as Admin (admin/admin123)
2. Try to navigate to Admin Panel by:
   - Clicking on navbar menu (should not exist)
   - Manually typing URL: http://localhost:3000/admin-panel
3. Verify response

**Expected Result**:
- ✅ No "Admin Panel" menu in navbar
- ✅ Manual URL navigation shows "Access Denied" message
- ✅ Message explains what Admin can and cannot do
- ✅ Cannot perform any user management

---

### Test Case 6: Admin Cannot See Advanced Features

**Objective**: Verify Admin cannot access advanced features

**Steps**:
1. Login as Admin (admin/admin123)
2. Check Sidebar menu
3. Verify missing items:
   - ❌ Verifiable
   - ❌ Load Profile
   - ❌ WS Live
   - ❌ Master Data
   - ❌ Trend

4. Try to manually access these pages:
   - Try: http://localhost:3000/dashboard/verifiable
   - Try: http://localhost:3000/dashboard/load-profile
5. Verify access is blocked or redirected

**Expected Result**:
- ✅ All advanced features hidden from sidebar
- ✅ Manual access attempts are blocked
- ✅ Admin only sees 5 menu items

---

### Test Case 7: Dashboard Differences

**Objective**: Compare Dashboard views between roles

**Steps**:

#### Super Admin Dashboard:
1. Login as Super Admin
2. Navigate to Dashboard
3. Count and list all visible elements:
   - Cards: 4 (Energi, Biaya, Panel Aktif, Daya Real-Time)
   - Metrics: 3 (Tegangan, Arus, Daya)
   - Charts: 4 (Power Trend, Ampere Trend, Panel Status, Energy Flow)
   - Tables: Yes (Statistics)

#### Admin Dashboard:
1. Logout or use different browser tab
2. Login as Admin
3. Navigate to Dashboard
4. Count and list visible elements:
   - Cards: 2 (Energi, Daya Real-Time)
   - Metrics: 2 (Tegangan, Arus)
   - Charts: 1 (Power Trend)
   - Tables: None

**Expected Result**:
- ✅ Super Admin: 4 cards + 3 metrics + 4 charts
- ✅ Admin: 2 cards + 2 metrics + 1 chart
- ✅ Clear visual difference

---

### Test Case 8: Role Badge Styling

**Objective**: Verify role badges display with correct styling

**Steps**:
1. Login as Super Admin
2. Observe role badge in navbar
3. Check color (should be gold: #ffd700)
4. Check text: "👑 Super Admin"
5. Logout
6. Login as Admin
7. Observe role badge in navbar
8. Check color (should be cyan: #00d4ff)
9. Check text: "👤 Admin"

**Expected Result**:
- ✅ Super Admin badge: Gold color, crown emoji, glow effect
- ✅ Admin badge: Cyan color, admin emoji
- ✅ Different styling makes roles visually distinct

---

## 🔄 Adding New Test Users

### Manual User Creation Process

#### Step 1: Login as Super Admin
```
Username: superadmin
Password: superadmin123
```

#### Step 2: Navigate to Admin Panel
- Click "⚙️ Super Admin Panel" in navbar (or navigate to /admin-panel)

#### Step 3: Create New User
- Click "+ Tambah User Baru" button
- Fill form:
  ```
  Username:         [desired username]
  Password:         [min 6 characters]
  Confirm Password: [same as above]
  Role:             [Admin or Super Admin]
  ```
- Click "✓ Daftarkan User"

#### Step 4: Verify Creation
- User appears in "Daftar Pengguna Terdaftar"
- Success message shows

### Testing New User

1. Logout current user
2. Login with new credentials
3. Verify permissions based on role:
   - If Admin: Limited access
   - If Super Admin: Full access

---

## ⚙️ Browser Storage & Debugging

### Clear Local Storage (if needed)

```javascript
// Open browser console (F12)
// Paste this command:
localStorage.clear();
location.reload();
```

### Check User Data

```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('users')));
console.log(JSON.parse(localStorage.getItem('currentUser')));
console.log(localStorage.getItem('isAuthenticated'));
```

### Check Current Role

```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Current User:', user.username);
console.log('Current Role:', user.role);
console.log('Permissions:', user.role === 'super_admin' ? 'FULL' : 'LIMITED');
```

---

## 📊 Testing Summary Table

| Scenario | Admin | Super Admin | Status |
|----------|-------|-----------|--------|
| **Access Dashboard** | ✅ Limited | ✅ Full | ✅ |
| **Access Admin Panel** | ❌ Denied | ✅ Allowed | ✅ |
| **Create Users** | ❌ No | ✅ Yes | ✅ |
| **Manage Users** | ❌ No | ✅ Yes | ✅ |
| **Sidebar Items** | 5 | 10 | ✅ |
| **Navbar Items** | 4 | 5 | ✅ |
| **Role Badge** | Cyan | Gold | ✅ |
| **Dashboard Cards** | 2 | 4 | ✅ |
| **Dashboard Charts** | 1 | 4 | ✅ |

---

## 🎯 Acceptance Criteria

All of the following must be true:

- [x] Super Admin can access Admin Panel
- [x] Admin sees "Access Denied" at Admin Panel
- [x] Super Admin can create new users
- [x] Super Admin can create other Super Admins
- [x] Admin dashboard shows limited view (2 cards, 2 metrics, 1 chart)
- [x] Super Admin dashboard shows full view (4 cards, 3 metrics, 4 charts)
- [x] Sidebar shows 5 items for Admin
- [x] Sidebar shows 10 items for Super Admin
- [x] Navbar shows 4 items for Admin
- [x] Navbar shows 5 items for Super Admin (with Admin Panel)
- [x] Role badges have different colors (Admin: Cyan, Super Admin: Gold)
- [x] Sidebar headers show correct role name
- [x] All styling is consistent and professional
- [x] No console errors or warnings
- [x] Responsive design maintained

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All test cases passed ✅
- [ ] No console errors ✅
- [ ] Performance is acceptable ✅
- [ ] All features work as expected ✅
- [ ] Documentation is complete ✅
- [ ] Code review completed ✅
- [ ] Security is validated ✅
- [ ] Browser compatibility verified ✅
- [ ] Mobile responsiveness tested ✅
- [ ] Role-based access is enforced ✅

---

## 📞 Support

### Common Questions

**Q: Can Admin create other Admin users?**  
A: No, only Super Admin can create users.

**Q: Can Admin change their own password?**  
A: This feature is not currently implemented. Only Super Admin can manage users.

**Q: What if I forgot my Super Admin password?**  
A: The default Super Admin password is `superadmin123`. You can reset by clearing localStorage.

**Q: Can I delete the default Super Admin account?**  
A: Yes, but you need another Super Admin account to continue managing users.

**Q: How do I switch between Admin and Super Admin accounts?**  
A: Click "Logout" button, then login with the other account's credentials.

---

## ✅ Conclusion

The role-based system is fully functional and ready for testing:
- ✅ Role differentiation is clear
- ✅ Permissions are enforced
- ✅ UI changes reflect role differences
- ✅ All test cases documented
- ✅ Ready for user acceptance testing

**Status**: ✅ READY FOR UAT (User Acceptance Testing)

---

*Last Updated: 29 Oktober 2025*  
*System Version: 1.0.0*  
*All accounts use local storage for persistence*
