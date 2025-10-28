# 🔍 DIAGNOSTIC - Super Admin Login Issue

## Status: TROUBLESHOOTING

Kami perlu check apa yang salah. Mari kita diagnosa langkah demi langkah.

---

## 🎯 STEP 1: Check Browser Console

### ✅ Buka Developer Tools
- Tekan: **F12**
- Pilih: **Console** tab
- Perhatikan: Adakah error merah?

### ✅ Look For Messages Like:
```
✅ Default users initialized and saved to localStorage
📦 Users loaded: admin, superadmin
```

**Jika Melihat Ini:**
- ✅ Initialization OK
- Go to STEP 2

**Jika TIDAK Melihat Ini:**
- ❌ Initialization FAILED
- Go to STEP 2A (Recovery)

---

## 🔧 STEP 2: Manual Diagnostic

Copy code ini ke console (F12 → paste):

```javascript
console.log('===== DIAGNOSTIC START =====');

// 1. Check localStorage
const users = localStorage.getItem('users');
console.log('1️⃣ localStorage.users exists?', users ? 'YES ✅' : 'NO ❌');

if (users) {
  try {
    const parsed = JSON.parse(users);
    console.log('2️⃣ Users parsed successfully:', parsed.length, 'users');
    parsed.forEach((u, i) => {
      console.log(`   [${i}] username: "${u.username}" | password: "${u.password}" | role: "${u.role}"`);
    });
  } catch (e) {
    console.log('2️⃣ ❌ ERROR parsing users:', e.message);
  }
} else {
  console.log('2️⃣ No users in localStorage');
}

// 2. Check currentUser
const currentUser = localStorage.getItem('currentUser');
console.log('3️⃣ currentUser stored?', currentUser ? 'YES ✅' : 'NO ❌ (expected if not logged in)');

// 3. Check isAuthenticated
const isAuth = localStorage.getItem('isAuthenticated');
console.log('4️⃣ isAuthenticated:', isAuth);

// 4. Test credentials manually
console.log('\n===== MANUAL TEST =====');
if (users) {
  const parsed = JSON.parse(users);
  const superadminUser = parsed.find(u => u.username === 'superadmin');
  
  if (superadminUser) {
    console.log('✅ Super Admin user found:', superadminUser);
    console.log('   Username match "superadmin"?', superadminUser.username === 'superadmin');
    console.log('   Password match "superadmin123"?', superadminUser.password === 'superadmin123');
  } else {
    console.log('❌ Super Admin user NOT found');
  }
}

console.log('===== DIAGNOSTIC END =====');
```

---

## 📋 EXPECTED OUTPUT (If Working):

```
===== DIAGNOSTIC START =====
1️⃣ localStorage.users exists? YES ✅
2️⃣ Users parsed successfully: 2 users
   [0] username: "admin" | password: "admin123" | role: "admin"
   [1] username: "superadmin" | password: "superadmin123" | role: "super_admin"
3️⃣ currentUser stored? NO ❌ (expected if not logged in)
4️⃣ isAuthenticated: null
===== MANUAL TEST =====
✅ Super Admin user found: {id: 2, username: "superadmin", password: "superadmin123", role: "super_admin", ...}
   Username match "superadmin"? true
   Password match "superadmin123"? true
===== DIAGNOSTIC END =====
```

---

## ❌ ISSUE #1: localStorage.users NOT EXISTS

**Symptom:**
```
1️⃣ localStorage.users exists? NO ❌
```

### 🔧 FIX:

Copy ini ke console:

```javascript
const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@pelbiot.com',
    name: 'Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'superadmin',
    password: 'superadmin123',
    role: 'super_admin',
    email: 'superadmin@pelbiot.com',
    name: 'Super Administrator',
    createdAt: new Date().toISOString()
  }
];

localStorage.setItem('users', JSON.stringify(defaultUsers));
console.log('✅ Users saved to localStorage');

// Verify
console.log('Verify:', localStorage.getItem('users') ? 'SUCCESS' : 'FAILED');
```

**Then:**
- Reload page (F5)
- Try Super Admin login again

---

## ❌ ISSUE #2: Users Parsed But Credentials Wrong

**Symptom:**
```
Password match "superadmin123"? false
```

**Possible Causes:**
- Space di awal/akhir password
- Character encoding issue
- Password tercopy dengan salah

### 🔧 FIX - Force Reinstall Users:

```javascript
// Clear semua
localStorage.clear();

// Buat baru
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@pelbiot.com',
    name: 'Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'superadmin',
    password: 'superadmin123',
    role: 'super_admin',
    email: 'superadmin@pelbiot.com',
    name: 'Super Administrator',
    createdAt: new Date().toISOString()
  }
];

localStorage.setItem('users', JSON.stringify(users));
console.log('✅ localStorage cleared and reset');

// Verify credentials
const saved = JSON.parse(localStorage.getItem('users'));
const sa = saved.find(u => u.username === 'superadmin');
console.log('Super Admin password:', sa.password);
console.log('Match "superadmin123"?', sa.password === 'superadmin123');
```

**Then:**
- Reload page (F5 or Ctrl+R)
- Try login

---

## ❌ ISSUE #3: Ambil Dari Server

Jika tidak ada di localStorage sama sekali, mungkin ini issue di initialization.

### 🔧 FIX - Force Re-Initialize:

```javascript
// 1. Clear localStorage
localStorage.clear();

// 2. Reload page - akan trigger initialization di AuthContext
location.reload();

// 3. Tunggu 2 detik, then check
setTimeout(() => {
  const users = localStorage.getItem('users');
  console.log('After reload - users stored?', users ? 'YES' : 'NO');
  if (users) {
    const parsed = JSON.parse(users);
    console.log('Users:', parsed.map(u => u.username));
  }
}, 2000);
```

---

## 🎯 NEXT STEPS

1. **Run diagnostic** → copy code from STEP 2 to console
2. **Check output** → match dengan expected output
3. **Apply fix** → follow issue #1, #2, or #3
4. **Reload** → F5
5. **Test** → try Super Admin login again

---

## 📞 If Still Not Working:

Screenshot of:
1. Browser console output (all messages)
2. F12 → Console → paste: `localStorage.getItem('users')`
3. What error appears when trying to login

Send screenshot ke developer.

---

**Status**: Run diagnostic now to identify exact issue  
**Time**: ~5 minutes to fix  
**Next**: Follow the issue number that matches your output

