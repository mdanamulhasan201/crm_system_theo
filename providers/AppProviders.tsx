'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CustomShaftDataProvider } from '@/contexts/CustomShaftDataContext';
import { ZustandProvider } from '@/providers/ZustandProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ZustandProvider>
      <LanguageProvider>
        <AuthProvider>
          <CustomShaftDataProvider>{children}</CustomShaftDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ZustandProvider>
  );
}
