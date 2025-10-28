# 🔍 STEP-BY-STEP - Test Login Super Admin

Berdasarkan screenshot Anda, ada error message di login form. Mari kita debug bersama-sama.

---

## ⚠️ LANGKAH 1: BUKA BROWSER CONSOLE

1. Tekan **F12** di keyboard
2. Klik tab **"Console"**
3. Kamu akan lihat black screen dengan text cursor

---

## 📋 LANGKAH 2: COPY & PASTE COMMAND INI

Copy seluruh command di bawah ini:

```javascript
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('=== USERS IN LOCALSTORAGE ===');
console.log('Total users found:', users.length);
if (users.length > 0) {
  console.table(users);
} else {
  console.log('❌ NO USERS FOUND - NEED TO INITIALIZE');
}
```

Paste ke console, tekan **ENTER**

---

## 📸 SCREENSHOT HASIL

Apa yang Anda lihat?

**Option A**: Table dengan 2 users (admin dan superadmin)
→ Lanjut ke LANGKAH 3

**Option B**: "NO USERS FOUND - NEED TO INITIALIZE"
→ Lanjut ke LANGKAH 4 (Fix)

---

## 🔧 LANGKAH 3: (Jika ada users) Cek Credentials

Paste command ini:

```javascript
const users = JSON.parse(localStorage.getItem('users'));
const sa = users.find(u => u.username === 'superadmin' && u.password === 'superadmin123');
console.log('Superadmin credentials match:', sa ? '✅ YES' : '❌ NO');
if (sa) console.log(sa);
```

Tekan **ENTER**

Expected output: `✅ YES` dan tampil data superadmin

---

## 🛠️ LANGKAH 4: (Jika no users) FIX - Initialize Users

Paste command ini:

```javascript
const users = [
  {id:1,username:'admin',password:'admin123',role:'admin',email:'admin@pelbiot.com',name:'Administrator',createdAt:new Date().toISOString()},
  {id:2,username:'superadmin',password:'superadmin123',role:'super_admin',email:'superadmin@pelbiot.com',name:'Super Administrator',createdAt:new Date().toISOString()}
];
localStorage.setItem('users', JSON.stringify(users));
console.log('✅ Users initialized');
console.table(users);
```

Tekan **ENTER**

Expected: Table dengan 2 users muncul

---

## 🔄 LANGKAH 5: RELOAD PAGE

1. Tekan **Ctrl + F5** (hard refresh)
2. Tunggu page fully load
3. Form login kembali kosong

---

## 🎯 LANGKAH 6: TRY LOGIN

1. Username field: ketik `superadmin`
2. Password field: ketik `superadmin123`
3. Klik button **LOGIN**

---

## ✅ EXPECTED RESULT

### If Success:
- ✅ Page berubah ke /dashboard
- ✅ Lihat role badge: 👑 Super Admin (gold color)
- ✅ Navbar menunjukkan lebih banyak menu items

### If Still Fails:
- Screenshot error message
- Screenshot console output
- Kasih tahu saya error apa yang muncul

---

## 🆘 QUICK SUMMARY

| Step | Action |
|------|--------|
| 1 | F12 → Console tab |
| 2 | Paste: Check users command |
| 3 | Paste: Test credentials command |
| 4 | If no users, paste: Initialize command |
| 5 | Ctrl+F5 (reload) |
| 6 | Login with superadmin/superadmin123 |

---

**Lakukan sekarang dan kasih tahu hasilnya!** 📢

