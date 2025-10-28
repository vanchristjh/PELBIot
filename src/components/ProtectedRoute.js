import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳ Loading...</div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin or super_admin
  const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  
  if (!isAdminOrSuperAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role requirements
  if (requireSuperAdmin && currentUser?.role !== 'super_admin') {
    return (
      <div className="access-denied">
        <h2>❌ Akses Ditolak</h2>
        <p>Hanya Super Admin yang dapat mengakses halaman ini</p>
        <p>Role Anda: <strong>{currentUser?.role}</strong></p>
      </div>
    );
  }

  if (requireAdmin && currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return (
      <div className="access-denied">
        <h2>❌ Akses Ditolak</h2>
        <p>Hanya Admin dan Super Admin yang dapat mengakses halaman ini</p>
        <p>Role Anda: <strong>{currentUser?.role}</strong></p>
      </div>
    );
  }

  // Check allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return (
      <div className="access-denied">
        <h2>❌ Akses Ditolak</h2>
        <p>Role Anda tidak memiliki akses ke halaman ini</p>
        <p>Role Anda: <strong>{currentUser?.role}</strong></p>
        <p>Role yang diizinkan: <strong>{allowedRoles.join(', ')}</strong></p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
