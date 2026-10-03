// Run this in Browser Console (F12) to diagnose the login issue

console.log("=".repeat(60));
console.log("🔍 SUPER ADMIN LOGIN DIAGNOSIS");
console.log("=".repeat(60));

// 1. Check localStorage.users
console.log("\n1️⃣  CHECKING USERS IN LOCALSTORAGE:");
const storageUsers = localStorage.getItem('users');
console.log("Raw value exists:", !!storageUsers);

if (storageUsers) {
  try {
    const users = JSON.parse(storageUsers);
    console.log("✅ Successfully parsed users");
    console.log("Total users:", users.length);
    console.table(users.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role
    })));
  } catch (e) {
    console.error("❌ Error parsing users:", e.message);
  }
} else {
  console.warn("⚠️  NO USERS IN LOCALSTORAGE!");
}

// 2. Try to find superadmin
console.log("\n2️⃣  SEARCHING FOR SUPERADMIN:");
try {
  const users = JSON.parse(storageUsers || '[]');
  const superadmin = users.find(u => u.username === 'superadmin');
  
  if (superadmin) {
    console.log("✅ FOUND SUPERADMIN USER:");
    console.log("   ID:", superadmin.id);
    console.log("   Username:", superadmin.username);
    console.log("   Password:", superadmin.password);
    console.log("   Role:", superadmin.role);
    console.log("   Email:", superadmin.email);
  } else {
    console.error("❌ SUPERADMIN NOT FOUND IN USERS");
    if (JSON.parse(storageUsers || '[]').length > 0) {
      console.log("Available users:", JSON.parse(storageUsers).map(u => u.username).join(', '));
    }
  }
} catch (e) {
  console.error("❌ Error searching for superadmin:", e);
}

// 3. Test login credentials
console.log("\n3️⃣  TESTING LOGIN CREDENTIALS:");
console.log("Username to test: 'superadmin'");
console.log("Password to test: 'superadmin123'");

try {
  const users = JSON.parse(storageUsers || '[]');
  const match = users.find(u => 
    u.username === 'superadmin' && 
    u.password === 'superadmin123'
  );
  
  if (match) {
    console.log("✅ CREDENTIALS MATCH FOUND!");
    console.log("Role:", match.role);
  } else {
    console.error("❌ NO MATCH FOR superadmin/superadmin123");
    console.log("\n🔧 Attempting to fix...");
    
    // Auto-fix: initialize users
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
    
    localStorage.clear();
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log("✅ USERS RE-INITIALIZED");
    console.log("Please refresh the page (Ctrl+F5) and try login again");
  }
} catch (e) {
  console.error("❌ Error testing credentials:", e);
}

// 4. Check currentUser
console.log("\n4️⃣  CHECKING CURRENT USER:");
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
  console.log("Current user:", JSON.parse(currentUser));
} else {
  console.log("No current user (not logged in)");
}

// 5. Check auth status
console.log("\n5️⃣  CHECKING AUTH STATUS:");
const isAuth = localStorage.getItem('isAuthenticated');
console.log("Is authenticated:", isAuth || 'false');

console.log("\n" + "=".repeat(60));
console.log("DIAGNOSIS COMPLETE");
console.log("=".repeat(60));
