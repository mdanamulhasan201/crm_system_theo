import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const normalizePath = (path: string): string => {
    return path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
};

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
    </div>
);

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { loading: featureLoading, isPathAllowed, features } = useFeatureAccess();
    const [hasRedirected, setHasRedirected] = useState(false);

    // Wait for API to load features - don't check routes until API data is loaded
    const hasFeatures = features && features.length > 0;
    const routeAllowed = hasFeatures && pathname ? isPathAllowed(pathname) : false;

    const findFirstAllowedRoute = useMemo(() => {
        if (!hasFeatures) return '/dashboard';

        const dashboardRoute = features.find(
            (item) => item.action && normalizePath(item.path) === '/dashboard'
        );
        if (dashboardRoute) return '/dashboard';

        const firstAllowed = features.find((item) => item.action);
        return firstAllowed ? firstAllowed.path : '/dashboard';
    }, [features, hasFeatures]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Wait for API to finish loading features
        if (featureLoading || !hasFeatures) return;

        if (pathname && !routeAllowed && !hasRedirected) {
            setHasRedirected(true);
            router.replace(findFirstAllowedRoute);
        }
    }, [isAuthenticated, featureLoading, routeAllowed, pathname, router, findFirstAllowedRoute, hasFeatures, hasRedirected]);

    if (!isAuthenticated) return null;
    // Show loading while API is fetching features
    if (featureLoading || !hasFeatures) return <LoadingSpinner />;
    // Block route if not allowed
    if (pathname && !routeAllowed) return <LoadingSpinner />;

    return <>{children}</>;
}
