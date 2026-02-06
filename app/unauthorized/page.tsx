'use client';

import { useEffect, useState, useRef } from 'react';
import { getAllDynamicRoutes } from '@/apis/dynamicApis';
import { getFirstAllowedRoute, type RoutePermission } from '@/lib/routePermissionUtils';

export default function UnauthorizedPage() {
  const [countdown, setCountdown] = useState(3);
  const redirectTriggered = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectPath, setRedirectPath] = useState<string>('/dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch features and get first allowed route - redirect immediately when found
  useEffect(() => {
    const fetchFirstAllowedRoute = async () => {
      try {
        const featuresResponse = await getAllDynamicRoutes();
        if (featuresResponse?.success && Array.isArray(featuresResponse.data)) {
          const permissions: RoutePermission[] = featuresResponse.data.map((feature: any) => ({
            path: feature.path,
            action: feature.action,
            nested: feature.nested?.map((n: any) => ({
              path: n.path,
              action: n.action,
            })),
          }));
          
          // Check if user is in employee mode
          const isEmployeeMode = typeof window !== 'undefined' && !!localStorage.getItem('employeeToken');
          const firstRoute = getFirstAllowedRoute(permissions, isEmployeeMode);
          setRedirectPath(firstRoute);
          setIsLoading(false);
          
          // Immediately redirect to first allowed route (skip countdown)
          if (firstRoute && !redirectTriggered.current) {
            redirectTriggered.current = true;
            setTimeout(() => {
              window.location.replace(firstRoute);
            }, 100);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch features for redirect:', error);
        setIsLoading(false);
        // Keep default '/dashboard' fallback
      }
    };

    fetchFirstAllowedRoute();
  }, []);

  // Countdown and redirect logic - only if we haven't redirected yet
  useEffect(() => {
    if (redirectTriggered.current || isLoading) return;

    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Trigger redirect after state update completes
          if (!redirectTriggered.current && typeof window !== 'undefined') {
            redirectTriggered.current = true;
            // Use queueMicrotask to ensure this runs after React's render
            queueMicrotask(() => {
              window.location.replace(redirectPath);
            });
          }
        }
        return newCount;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [redirectPath, isLoading]);

  // Handle manual redirect button click
  const handleRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!redirectTriggered.current && typeof window !== 'undefined') {
      redirectTriggered.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.location.replace(redirectPath);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <svg
            className="mx-auto h-20 w-20 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Zugriff verweigert
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Sie werden automatisch in {countdown} Sekunde{countdown !== 1 ? 'n' : ''} weitergeleitet...
        </p>
        <button
          onClick={handleRedirect}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Jetzt weiterleiten
        </button>
      </div>
    </div>
  );
}

