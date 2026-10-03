// Browser Console Debug Commands

// Jalankan ini di browser console (F12) untuk debugging:

// 1. CEK USERS DI LOCALSTORAGE
console.log("USERS IN LOCALSTORAGE:");
console.log(JSON.parse(localStorage.getItem('users')));

// 2. CEK CURRENT USER
console.log("CURRENT USER:");
console.log(JSON.parse(localStorage.getItem('currentUser')));

// 3. CEK AUTH STATUS
console.log("IS AUTHENTICATED:");
console.log(localStorage.getItem('isAuthenticated'));

// 4. CLEAR SEMUA DAN RELOAD
localStorage.clear();
window.location.reload();

// 5. INITIALIZE DEFAULT USERS MANUALLY
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
console.log('Users reset:', defaultUsers);
