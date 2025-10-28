// PASTE THIS IN BROWSER CONSOLE (F12) TO TEST SUPER ADMIN LOGIN

console.log("=".repeat(60));
console.log("🔍 SUPER ADMIN LOGIN VERIFICATION TEST");
console.log("=".repeat(60));

// 1. Check localStorage
console.log("\n✓ Step 1: Checking localStorage...");
const storedUsers = localStorage.getItem('users');
console.log("Users in localStorage:", storedUsers ? "✅ EXISTS" : "❌ NOT FOUND");

if (storedUsers) {
  const users = JSON.parse(storedUsers);
  console.log("Total users:", users.length);
  users.forEach((user, index) => {
    console.log(`  [${index}] ${user.username} (${user.role})`);
  });
}

// 2. Check superadmin specifically
console.log("\n✓ Step 2: Looking for superadmin user...");
const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
const superadminUser = allUsers.find(u => u.username === 'superadmin' && u.password === 'superadmin123');

if (superadminUser) {
  console.log("✅ FOUND superadmin user!");
  console.log("  - Username:", superadminUser.username);
  console.log("  - Password:", superadminUser.password);
  console.log("  - Role:", superadminUser.role);
  console.log("  - Email:", superadminUser.email);
} else {
  console.log("❌ SUPERADMIN NOT FOUND - Need to initialize");
}

// 3. Check admin user
console.log("\n✓ Step 3: Looking for admin user...");
const adminUser = allUsers.find(u => u.username === 'admin' && u.password === 'admin123');

if (adminUser) {
  console.log("✅ FOUND admin user!");
  console.log("  - Username:", adminUser.username);
  console.log("  - Role:", adminUser.role);
} else {
  console.log("❌ ADMIN NOT FOUND - Need to initialize");
}

// 4. If users not found, initialize them
console.log("\n✓ Step 4: Initializing default users if needed...");
if (!superadminUser || !adminUser) {
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
  console.log("✅ Users initialized and saved to localStorage");
  console.log("👉 Refresh page now to load the users");
} else {
  console.log("✅ All required users already exist");
}

// 5. Summary
console.log("\n" + "=".repeat(60));
console.log("📋 SUMMARY:");
console.log("=".repeat(60));
console.log("\nYou can now try to login with:");
console.log("  Admin Account:");
console.log("    - Username: admin");
console.log("    - Password: admin123");
console.log("\n  Super Admin Account:");
console.log("    - Username: superadmin");
console.log("    - Password: superadmin123");
console.log("\n💡 TIP: If you just initialized users, refresh the page first");
console.log("        Then try logging in again");
console.log("\n" + "=".repeat(60));
