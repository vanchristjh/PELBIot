# 🔧 TROUBLESHOOTING - Super Admin Login Issue

## ❌ Masalah: Super Admin tidak bisa login

### ✅ SOLUSI CEPAT (Coba ini dulu)

#### 1. REFRESH BROWSER CACHE
```
Tekan: Ctrl + Shift + Delete
Pilih: Clear all
Klik: Clear
```

#### 2. CLEAR LOCALSTORAGE
Buka **Browser Console** (F12), paste perintah ini:
```javascript
localStorage.clear();
location.reload();
```

#### 3. RESTART REACT APP
Tutup terminal React (Ctrl+C), lalu:
```bash
npm start
```

---

## 🔍 VERIFIKASI YANG LEBIH DETAIL

### Step 1: Cek Users di LocalStorage
Buka Browser Console (F12), paste:
```javascript
console.log("USERS IN LOCALSTORAGE:");
console.log(JSON.parse(localStorage.getItem('users')));
```

**Expected Output**:
```javascript
[
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@pelbiot.com',
    ...
  },
  {
    id: 2,
    username: 'superadmin',
    password: 'superadmin123',
    role: 'super_admin',
    email: 'superadmin@pelbiot.com',
    ...
  }
]
```

**Jika tidak ada atau kosong**:
```javascript
// Initialize manually
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
console.log('✅ Users initialized');
```

### Step 2: Cek Credentials Tepat
Verifikasi username dan password:
```javascript
// Buka console, jalankan ini:
const users = JSON.parse(localStorage.getItem('users'));
users.forEach(u => {
  console.log(`${u.username}: password="${u.password}" role="${u.role}"`);
});
```

**Expected**:
```
admin: password="admin123" role="admin"
superadmin: password="superadmin123" role="super_admin"
```

### Step 3: Test Login Function
```javascript
// Di console, test login langsung:
const users = JSON.parse(localStorage.getItem('users'));
const superadmin = users.find(u => 
  u.username === 'superadmin' && 
  u.password === 'superadmin123'
);
console.log('Found:', superadmin);
```

**Expected**: Harus return object dengan role "super_admin"

---

## 🔐 CREDENTIALS YANG BENAR

### ✅ Admin
```
Username: admin
Password: admin123
```

### ✅ Super Admin
```
Username: superadmin
Password: superadmin123
```

**PERHATIAN**: Password CASE-SENSITIVE (besar/kecil huruf hitung)

---

## 🐛 DEBUG STEP-BY-STEP

### 1. Cek apakah Auth Context initialize default users
Di Console, cek:
```javascript
console.log(localStorage.getItem('users'));
```

**Harus tidak empty**

### 2. Cek apakah login function dipanggil
Pada Login page, tekan F12 → Console
Coba login → lihat console log:
```
🔐 Login attempt: username="superadmin", password="superadmin123"
📦 localStorage.getItem("users"): EXISTS
👥 Total users available: 2
👥 Users list: [...]
Checking admin: username=false, password=false
Checking superadmin: username=true, password=true
🔍 User found: YES - superadmin (super_admin)
✅ Login successful as: super_admin
```

Jika tidak muncul, refresh page dulu.

### 3. Cek apakah navigate ke dashboard
Setelah login berhasil, harusnya redirect ke `/dashboard`

---

## 🚨 ERROR MESSAGES & SOLUSI

### Error: "Username atau password salah!"

**Penyebab**: 
- Username atau password tidak cocok
- Users belum diinisialisasi

**Solusi**:
```javascript
// Clear dan reinit
localStorage.clear();
location.reload();
```

### Error: "Hanya Admin dan Super Admin yang dapat akses!"

**Penyebab**: Role user bukan admin atau super_admin

**Solusi**:
Cek role di localStorage:
```javascript
console.log(JSON.parse(localStorage.getItem('users')));
```

---

## 📋 CHECKLIST

- [ ] Browser cache sudah di-clear
- [ ] localStorage sudah di-clear
- [ ] React app sudah di-restart
- [ ] Username: superadmin (case-sensitive)
- [ ] Password: superadmin123 (case-sensitive)
- [ ] Users ada di localStorage (2 users)
- [ ] Console menunjukkan "✅ Login successful"
- [ ] Redirect ke dashboard terjadi

---

## 🎯 JIKA MASIH TIDAK BISA

### Option 1: Clear Semuanya
```bash
# Terminal
cd d:\PROJECT\PT\pelbiot
npm start
```

Tekan Ctrl+Shift+Delete di browser → Clear all → Reload

### Option 2: Check Console Logs
Buka F12 → Console → Coba login
Cari error messages dan error stack trace

### Option 3: Reset File
Hapus semua localStorage yang corrupt:

Di Console:
```javascript
// Hapus semua data
localStorage.removeItem('users');
localStorage.removeItem('currentUser');
localStorage.removeItem('isAuthenticated');

// Reinitialize
location.reload();
```

---

## ✅ VERIFIKASI SUKSES

Jika berhasil, Anda akan melihat:

1. **Console Log**:
```
✅ Login successful as: super_admin
```

2. **Page Redirect**:
Dari `/login` → `/dashboard`

3. **UI Changes**:
- Role badge: 👑 Super Admin (warna emas)
- Navbar: Ada menu "Super Admin Panel"
- Sidebar: 10 menu items
- Header: "👑 Super Admin Control Panel"

---

## 📞 QUICK COMMANDS

Jika login tidak jalan, paste ini ke console satu persatu:

```javascript
// 1. Clear all
localStorage.clear();

// 2. Check
console.log(localStorage.getItem('users'));

// 3. Reinit if empty
if (!localStorage.getItem('users')) {
  const users = [
    {id:1,username:'admin',password:'admin123',role:'admin',email:'admin@pelbiot.com',name:'Administrator',createdAt:new Date().toISOString()},
    {id:2,username:'superadmin',password:'superadmin123',role:'super_admin',email:'superadmin@pelbiot.com',name:'Super Administrator',createdAt:new Date().toISOString()}
  ];
  localStorage.setItem('users', JSON.stringify(users));
}

// 4. Verify
console.log(JSON.parse(localStorage.getItem('users')));

// 5. Refresh
location.reload();
```

---

**Status**: ✅ Harus berhasil setelah mengikuti langkah-langkah di atas

*Jika masih bermasalah, check console log untuk error messages*
