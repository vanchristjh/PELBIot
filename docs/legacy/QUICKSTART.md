## 🚀 Panduan Cepat Memulai

### **Admin Credentials (Demo)**
```
Username: admin
Password: admin123
```

### **Cara Jalankan Aplikasi**
```bash
npm install      # Install dependencies
npm start        # Jalankan development server
```

Aplikasi akan buka di: `http://localhost:3000`

---

## 📋 Fitur yang Tersedia

### **1. Login Page** 🔐
- Login dengan username & password
- Demo button untuk testing cepat

### **2. Dashboard** 📊
- Profile info user
- Statistik sistem
- Akses ke fitur sesuai role

### **3. Admin Panel** 👨‍💼 *(Admin Only)*
- Mendaftarkan user baru
- Melihat daftar semua user
- Manajemen role user

---

## 🎯 Workflow Singkat

1. **Login** dengan admin/admin123
2. **Dashboard** akan menampilkan info anda
3. Klik **"Kelola User"** untuk akses Admin Panel
4. **Tambah User Baru** dengan form yang disediakan
5. Lihat daftar user di table bawah
6. **Logout** kapan saja dari navbar

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| `src/contexts/AuthContext.js` | Logic autentikasi & state management |
| `src/pages/Login.js` | Halaman login |
| `src/pages/Dashboard.js` | Halaman dashboard |
| `src/pages/AdminPanel.js` | Halaman admin |
| `src/App.js` | Router setup |

---

## 🔑 Fitur Keamanan

✅ Session management dengan localStorage  
✅ Protected routes untuk halaman tertentu  
✅ Role-based access control  
✅ Validasi input pada semua form  
✅ Redirect otomatis jika belum login  

---

## 📝 Nota Penting

- Data disimpan di localStorage (development only)
- Untuk production, gunakan backend + database
- Admin account default bisa dihapus & diganti nanti
- Password disimpan plain text (untuk demo saja!)

---

**Selamat mencoba! 🎉**

Untuk dokumentasi lengkap, baca file `DOKUMENTASI.md`
