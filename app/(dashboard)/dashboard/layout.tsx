'use client'
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '../../../lib/protected-route';
import { FeatureAccessProvider } from '@/contexts/FeatureAccessContext';
import { QueryProvider } from '@/providers/QueryProvider';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <QueryProvider>
            <FeatureAccessProvider>
                <ProtectedRoute>
                    <DashboardLayout>
                        {children}
                    </DashboardLayout>
                </ProtectedRoute>
            </FeatureAccessProvider>
        </QueryProvider>
    );
}
