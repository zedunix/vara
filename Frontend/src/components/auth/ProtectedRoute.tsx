import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Only allow admin / superadmin users */
  requireAdmin?: boolean;
  /** Only allow regular (non-admin) users */
  requireUser?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireUser = false,
}: ProtectedRouteProps) {
  const { token, user, isRestoring } = useAuthStore();

  // Session is still being read from storage — render nothing yet
  if (isRestoring) return null;

  // Not authenticated at all
  if (!token) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Route is admin-only but user is not admin
  if (requireAdmin && !isAdmin) return <Navigate to="/user-member" replace />;

  // Route is member-only but user is admin
  if (requireUser && isAdmin) return <Navigate to="/user-admin" replace />;

  return <>{children}</>;
}
