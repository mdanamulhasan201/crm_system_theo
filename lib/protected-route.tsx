'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';
import { isRouteAllowed, flattenPermissions, getFirstAllowedRoute, normalizePath } from '@/lib/routePermissionUtils';
import type { RoutePermission } from '@/lib/routePermissionUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  unauthorizedRedirectPath?: string;
}

const LoadingSpinner = () => null;

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on permission system.
 * - Checks authentication first
 * - Then checks route permissions
 * - Redirects to unauthorized page or first allowed route if access denied
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <YourPageContent />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({ 
  children, 
  unauthorizedRedirectPath = '/unauthorized' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isEmployeeMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { loading: featureLoading, features } = useFeatureAccess();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Convert features to RoutePermission format
  const permissions: RoutePermission[] = useMemo(() => {
    return features.map(feature => ({
      path: feature.path,
      action: feature.action,
      nested: feature.nested?.map(n => ({
        path: n.path,
        action: n.action,
      })),
    }));
  }, [features]);

  // Create permission map for fast lookups
  const permissionMap = useMemo(() => {
    return flattenPermissions(permissions);
  }, [permissions]);

  // Check if current route is allowed
  const routeAllowed = useMemo(() => {
    if (!pathname || featureLoading || permissions.length === 0) {
      // Allow employee-profile even while loading if user is in employee mode
      if (pathname === '/dashboard/employee-profile' && isEmployeeMode) {
        return true;
      }
      return false;
    }
    return isRouteAllowed(pathname, permissionMap);
  }, [pathname, featureLoading, permissionMap, permissions.length, isEmployeeMode]);
  const firstAllowedRoute = useMemo(() => {
    if (permissions.length === 0) {
      return isEmployeeMode ? '/dashboard/employee-profile' : '/dashboard';
    }
    return getFirstAllowedRoute(permissions, isEmployeeMode);
  }, [permissions, isEmployeeMode]);

  // Handle redirects
  useEffect(() => {
    // Wait for authentication check
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Wait for permissions to load
    if (featureLoading || permissions.length === 0) {
      return;
    }

    // Redirect if route is not allowed
    if (pathname && !routeAllowed && !hasRedirected) {
      setHasRedirected(true);
      
      // Always redirect to first allowed route (skip unauthorized page)
      // Use setTimeout to avoid React render cycle issues
      setTimeout(() => {
        router.replace(firstAllowedRoute);
      }, 0);
    }
  }, [
    isAuthenticated,
    featureLoading,
    routeAllowed,
    pathname,
    router,
    firstAllowedRoute,
    unauthorizedRedirectPath,
    hasRedirected,
    permissions.length,
  ]);

  // Not authenticated - don't render anything
  if (!isAuthenticated) {
    return null;
  }

  // Loading permissions - don't show spinner, let default loading handle it
  if (featureLoading || permissions.length === 0) {
    return null;
  }

  // Route not allowed - redirect to unauthorized page (don't show anything here)
  if (pathname && !routeAllowed) {
    return null; // Redirect will happen in useEffect
  }

  // Route allowed - render children
  return <>{children}</>;
}
