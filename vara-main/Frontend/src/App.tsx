import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePassword from './pages/create-password';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppRoutes() {
  const { token, user } = useAuth();

  const getDashboardRedirect = () => {
    if (!token) return <Navigate to="/login" />;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    return <Navigate to={isAdmin ? '/user-admin' : '/user-member'} />;
  };

  return (
    <Routes>
      {/* Public routes — redirect to dashboard if already logged in */}
      <Route path="/login" element={token ? getDashboardRedirect() : <Login />} />
      <Route path="/register" element={token ? getDashboardRedirect() : <Register />} />
      <Route path="/create-password" element={token ? getDashboardRedirect() : <CreatePassword />} />
      <Route path="/forgot-password" element={token ? getDashboardRedirect() : <ForgotPassword />} />

      {/* Protected routes */}
      <Route
        path="/user-admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-member/*"
        element={
          <ProtectedRoute requireUser>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={getDashboardRedirect()} />
      <Route path="/user-dashboard" element={<Navigate to="/user-member" replace />} />
      <Route path="/admin-dashboard" element={<Navigate to="/user-admin" replace />} />

      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              token
                ? user?.role === 'admin' || user?.role === 'superadmin'
                  ? '/user-admin'
                  : '/user-member'
                : '/login'
            }
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

