// ⚡ SUPER ADMIN LOGIN FIX - ONE LINER
// Copy everything below, paste to F12 console, press Enter

localStorage.clear();const a=[{id:1,username:'admin',password:'admin123',role:'admin',email:'admin@pelbiot.com',name:'Administrator',createdAt:new Date().toISOString()},{id:2,username:'superadmin',password:'superadmin123',role:'super_admin',email:'superadmin@pelbiot.com',name:'Super Administrator',createdAt:new Date().toISOString()}];localStorage.setItem('users',JSON.stringify(a));console.log('✅ FIXED');setTimeout(()=>{location.reload()},1000);
