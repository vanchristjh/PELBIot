// Save this as a bookmark in your browser to test localStorage
// javascript:
(function() {
  console.log("=== PELBIOT LOGIN DIAGNOSTIC ===");
  
  // Check localStorage
  const users = localStorage.getItem('users');
  console.log("📦 localStorage 'users':", users ? "EXISTS" : "MISSING");
  
  if (users) {
    try {
      const parsed = JSON.parse(users);
      console.log("✅ Users parsed successfully:", parsed.length, "users");
      parsed.forEach(u => {
        console.log(`  - ${u.username}: ${u.role}`);
      });
    } catch (e) {
      console.error("❌ Error parsing users:", e);
    }
  }
  
  // Check current user
  const currentUser = localStorage.getItem('currentUser');
  console.log("👤 localStorage 'currentUser':", currentUser ? "EXISTS" : "MISSING");
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      console.log(`  Logged in as: ${user.username} (${user.role})`);
    } catch (e) {
      console.error("❌ Error parsing currentUser:", e);
    }
  }
  
  // Test credentials
  console.log("\n=== TESTING CREDENTIALS ===");
  const testCreds = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'superadmin', password: 'superadmin123', role: 'super_admin' }
  ];
  
  if (users) {
    const usersList = JSON.parse(users);
    testCreds.forEach(cred => {
      const found = usersList.find(u => u.username === cred.username && u.password === cred.password);
      if (found) {
        console.log(`✅ ${cred.username}: FOUND (${found.role})`);
      } else {
        console.log(`❌ ${cred.username}: NOT FOUND`);
      }
    });
  }
  
  console.log("\n=== END DIAGNOSTIC ===");
})();
