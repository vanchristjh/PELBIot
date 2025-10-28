import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PanelDistribusi = lazy(() => import('./pages/PanelDistribusi'));
const Trafo = lazy(() => import('./pages/Trafo'));
const Laporan = lazy(() => import('./pages/Laporan'));
const Alarm = lazy(() => import('./pages/Alarm'));
const Report = lazy(() => import('./pages/Report'));
const LoadProfile = lazy(() => import('./pages/LoadProfile'));
const WeatherStation = lazy(() => import('./pages/WeatherStation'));
const WSLive = lazy(() => import('./pages/WSLive'));
const MasterData = lazy(() => import('./pages/MasterData'));
const Verifiable = lazy(() => import('./pages/Verifiable'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const Trend = lazy(() => import('./pages/Trend'));
const Login = lazy(() => import('./pages/Login'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const LoadingFallback = () => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#00d4ff' }}>
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Login Route - No Protection */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Hanya admin dan super_admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/verifiable"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Verifiable />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/alarm"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Alarm />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/report"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Report />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/load-profile"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <LoadProfile />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/weather-station"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <WeatherStation />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ws-live"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <WSLive />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/master-data"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <MasterData />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/trend"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Trend />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/tutorial"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Tutorial />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/panel-distribusi"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <PanelDistribusi />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trafo"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Trafo />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <Laporan />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin Panel Route - Hanya Admin dan Super Admin */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div className="app-wrapper">
                <Navbar />
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminPanel />
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
