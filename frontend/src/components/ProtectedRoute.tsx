import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  children:      ReactNode;
  requiredRole?: UserRole;   // if omitted, any authenticated user is allowed
}

/**
 * ProtectedRoute
 * - Unauthenticated users → /login
 * - Still loading role → spinner (never blank screen)
 * - Wrong role → redirected to their own dashboard
 * - Correct role → renders children
 */
export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { currentUser, userRole, roleLoading } = useAuth();

  // Not logged in
  if (!currentUser) return <Navigate to="/login" replace />;

  // Still fetching the user's role from Supabase
  if (roleLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  // Role check — redirect wrong-role users to their own dashboard
  if (requiredRole && userRole !== requiredRole) {
    const redirect = userRole === 'ecell_member' ? '/ecell-dashboard' : '/student-dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
