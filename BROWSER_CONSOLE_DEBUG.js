// PASTE THIS INTO BROWSER CONSOLE (F12 → Console) TO DEBUG

console.clear();
console.log('=== PELBIOT LOGIN DEBUG ===\n');

// Check 1: localStorage exists?
console.log('1️⃣ CHECK LOCALSTORAGE:');
const usersJson = localStorage.getItem('users');
console.log('   localStorage.getItem("users"):', usersJson ? '✅ EXISTS' : '❌ MISSING');

// Check 2: Parse users
console.log('\n2️⃣ PARSE USERS:');
if (usersJson) {
    try {
        const users = JSON.parse(usersJson);
        console.log('   Parsed users:', users.length, 'users found');
        users.forEach(u => {
            console.log(`   - ${u.username} | password: ${u.password} | role: ${u.role}`);
        });
    } catch (e) {
        console.error('   ❌ Error parsing users:', e);
    }
} else {
    console.log('   ❌ No users in localStorage - will use default');
}

// Check 3: Test credentials
console.log('\n3️⃣ TEST CREDENTIALS:');
const testCreds = [
    { username: 'admin', password: 'admin123' },
    { username: 'superadmin', password: 'superadmin123' }
];

if (usersJson) {
    const users = JSON.parse(usersJson);
    testCreds.forEach(cred => {
        const found = users.find(u => u.username === cred.username && u.password === cred.password);
        if (found) {
            console.log(`   ✅ ${cred.username} / ${cred.password}: FOUND (role: ${found.role})`);
        } else {
            console.log(`   ❌ ${cred.username} / ${cred.password}: NOT FOUND`);
        }
    });
}

// Check 4: Current user
console.log('\n4️⃣ CURRENT USER:');
const currentUserJson = localStorage.getItem('currentUser');
const isAuth = localStorage.getItem('isAuthenticated');
console.log('   currentUser:', currentUserJson ? '✅ EXISTS' : '❌ MISSING');
console.log('   isAuthenticated:', isAuth);
if (currentUserJson) {
    const user = JSON.parse(currentUserJson);
    console.log('   Logged in as:', user.username, '(' + user.role + ')');
}

console.log('\n=== END DEBUG ===\n');
console.log('💡 TIP: If users is MISSING, page will initialize with default users.');
console.log('💡 TIP: Refresh page (F5) if users was just created.');
