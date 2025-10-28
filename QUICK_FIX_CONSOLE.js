// ⚡ QUICK FIX - COPY & PASTE THIS INTO BROWSER CONSOLE (F12)

// Step 1: Clear everything
localStorage.clear();
console.log('✅ Cleared all localStorage');

// Step 2: Create default users
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

// Step 3: Save to localStorage
localStorage.setItem('users', JSON.stringify(defaultUsers));
console.log('✅ Saved default users to localStorage');

// Step 4: Verify
const saved = JSON.parse(localStorage.getItem('users'));
console.log('✅ Verification - Users in storage:');
saved.forEach(u => console.log('   -', u.username, '/' + u.password));

// Step 5: Reload page
console.log('\n⏳ Reloading page in 2 seconds...');
setTimeout(() => {
  location.reload();
}, 2000);

console.log('🎯 Done! Page will reload. Try Super Admin login when ready.');
