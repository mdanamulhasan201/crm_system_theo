'use client'
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '../../../lib/protected-route';
import { FeatureAccessProvider } from '@/contexts/FeatureAccessContext';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <FeatureAccessProvider>
            <ProtectedRoute>
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            </ProtectedRoute>
        </FeatureAccessProvider>
    );
}
