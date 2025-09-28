'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Component to protect routes based on user role
 * @param children The content to render if user has access
 * @param allowedRoles Array of roles that can access this route
 * @param redirectTo Path to redirect if user doesn't have access (defaults to /dashboard)
 */
export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and either no user or not one of the allowed roles, redirect
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      router.push(redirectTo);
    }
  }, [user, loading, router, allowedRoles, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user has appropriate role, render the children
  return (user && allowedRoles.includes(user.role)) ? <>{children}</> : null;
} 