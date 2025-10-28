import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data dari localStorage
  useEffect(() => {
    // SELALU set default users jika belum ada
    const initializeUsers = () => {
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
      
      const storedUsers = localStorage.getItem('users');
      let usersToUse;
      
      if (!storedUsers) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('✅ Default users initialized and saved to localStorage');
        usersToUse = defaultUsers;
      } else {
        try {
          usersToUse = JSON.parse(storedUsers);
          console.log('✅ Users already exist in localStorage');
        } catch (e) {
          console.error('❌ Error parsing stored users, reinitializing:', e);
          localStorage.setItem('users', JSON.stringify(defaultUsers));
          usersToUse = defaultUsers;
        }
      }
      
      return usersToUse;
    };

    const usersToSet = initializeUsers();
    setUsers(usersToSet);
    console.log('📦 Users loaded:', usersToSet.map(u => ({ username: u.username, role: u.role })));

    const storedCurrentUser = localStorage.getItem('currentUser');
    const storedAuth = localStorage.getItem('isAuthenticated');

    if (storedCurrentUser && storedAuth === 'true') {
      try {
        setCurrentUser(JSON.parse(storedCurrentUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing current user:', e);
      }
    }

    setLoading(false);
  }, []);

  const login = (username, password) => {
    console.log(`🔐 Login attempt: username="${username}", password="${password}"`);
    
    // Get users dari localStorage langsung (paling reliable)
    const storedUsers = localStorage.getItem('users');
    console.log('📦 localStorage.getItem("users"):', storedUsers ? 'EXISTS' : 'MISSING');
    
    let usersList = [];
    try {
      usersList = storedUsers ? JSON.parse(storedUsers) : users;
    } catch (e) {
      console.error('❌ Error parsing users:', e);
      return { success: false, message: 'Error system error!' };
    }
    
    console.log('👥 Total users available:', usersList.length);
    console.log('👥 Users list:', usersList.map(u => ({
      username: u.username,
      password: u.password,
      role: u.role
    })));
    
    // Search for user dengan exact match
    const user = usersList.find(u => {
      const usernameMatch = u.username === username;
      const passwordMatch = u.password === password;
      console.log(`  Checking ${u.username}: username=${usernameMatch}, password=${passwordMatch}`);
      return usernameMatch && passwordMatch;
    });
    
    console.log('🔍 User found:', user ? `YES - ${user.username} (${user.role})` : 'NOT FOUND');
    
    if (user) {
      // Check if user is admin or super_admin
      if (user.role === 'admin' || user.role === 'super_admin') {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        console.log('✅ Login successful as:', user.role);
        return { success: true, message: `Login berhasil sebagai ${user.role}!` };
      } else {
        console.warn('⚠️ User role not authorized:', user.role);
        return { success: false, message: 'Hanya Admin dan Super Admin yang dapat akses!' };
      }
    } else {
      console.warn('❌ User not found or password incorrect');
      console.warn('Expected username:', username, '| Expected password:', password);
      return { success: false, message: 'Username atau password salah!' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  };

  const registerUser = (username, password, role = 'admin') => {
    // Get users dari localStorage langsung
    const storedUsers = localStorage.getItem('users');
    const usersList = storedUsers ? JSON.parse(storedUsers) : users;
    
    // Validasi role hanya admin atau super_admin
    if (role !== 'admin' && role !== 'super_admin') {
      return { success: false, message: 'Role hanya bisa admin atau super_admin!' };
    }

    // Validasi username sudah ada
    if (usersList.some(u => u.username === username)) {
      return { success: false, message: 'Username sudah terdaftar!' };
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return { success: false, message: 'Password harus minimal 6 karakter!' };
    }

    const newUser = {
      id: usersList.length + 1,
      username,
      password,
      role,
      email: `${username}@pelbiot.com`,
      name: role === 'super_admin' ? 'Super ' + username : username,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...usersList, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    return { success: true, message: `${role} berhasil didaftarkan!`, user: newUser };
  };

  const value = {
    isAuthenticated,
    currentUser,
    users,
    setUsers,
    loading,
    login,
    logout,
    registerUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Definisi permissions untuk setiap role
const rolePermissions = {
  admin: {
    canViewDashboard: true,
    canViewReports: true,
    canViewPanelDistribusi: true,
    canViewTrafo: true,
    canViewWeatherStation: true,
    canViewLaporan: true,
    canViewLoadProfile: true,
    canAccessAdminPanel: false, // Admin TIDAK bisa akses admin panel
    canManageUsers: false, // Admin TIDAK bisa manage users
    canManageSuperAdmin: false, // Admin TIDAK bisa manage super admin
    canViewAuditLog: false, // Admin TIDAK bisa lihat audit log
    canManageSystemSettings: false, // Admin TIDAK bisa manage system settings
    canExportData: true,
    canViewRealtime: true,
    canAccessAdvancedFeatures: false // Admin TIDAK bisa akses fitur advanced
  },
  super_admin: {
    canViewDashboard: true,
    canViewReports: true,
    canViewPanelDistribusi: true,
    canViewTrafo: true,
    canViewWeatherStation: true,
    canViewLaporan: true,
    canViewLoadProfile: true,
    canAccessAdminPanel: true, // Super Admin BISA akses admin panel
    canManageUsers: true, // Super Admin BISA manage users
    canManageSuperAdmin: true, // Super Admin BISA manage super admin
    canViewAuditLog: true, // Super Admin BISA lihat audit log
    canManageSystemSettings: true, // Super Admin BISA manage system settings
    canExportData: true,
    canViewRealtime: true,
    canAccessAdvancedFeatures: true // Super Admin BISA akses fitur advanced
  }
};

// Hook untuk check apakah user memiliki role tertentu
export const useRoleCheck = () => {
  const { currentUser } = useAuth();

  return {
    isSuperAdmin: () => currentUser?.role === 'super_admin',
    isAdmin: () => currentUser?.role === 'admin',
    isAdminOrSuper: () => currentUser?.role === 'admin' || currentUser?.role === 'super_admin',
    hasRole: (role) => currentUser?.role === role,
    getCurrentRole: () => currentUser?.role || null,
    hasPermission: (permission) => {
      const role = currentUser?.role;
      if (!role || !rolePermissions[role]) return false;
      return rolePermissions[role][permission] === true;
    },
    getPermissions: () => {
      const role = currentUser?.role;
      if (!role || !rolePermissions[role]) return {};
      return rolePermissions[role];
    },
    // Specific permission checks
    canAccessAdminPanel: () => rolePermissions[currentUser?.role]?.canAccessAdminPanel === true,
    canManageUsers: () => rolePermissions[currentUser?.role]?.canManageUsers === true,
    canManageSuperAdmin: () => rolePermissions[currentUser?.role]?.canManageSuperAdmin === true,
    canViewAuditLog: () => rolePermissions[currentUser?.role]?.canViewAuditLog === true,
    canManageSystemSettings: () => rolePermissions[currentUser?.role]?.canManageSystemSettings === true,
    canAccessAdvancedFeatures: () => rolePermissions[currentUser?.role]?.canAccessAdvancedFeatures === true
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};
