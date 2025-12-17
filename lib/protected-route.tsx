import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentRouteAccess } from '@/contexts/FeatureAccessContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { loading: featureLoading, allowed } = useCurrentRouteAccess();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            setAuthChecked(true);
            return;
        }

        if (!featureLoading) {
            if (!allowed && pathname?.startsWith('/dashboard')) {
                router.replace('/dashboard');
            }
            setAuthChecked(true);
        }
    }, [isAuthenticated, featureLoading, allowed, pathname, router]);

    if (!authChecked || featureLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return children;
}