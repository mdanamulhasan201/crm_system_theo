"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { userCheckAuth } from '@/apis/authApis';

interface User {
  id: string;
  partnerId?: string | null;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  phone: string | null;
  absenderEmail: string | null;
  bankName: string | null;
  bankNumber: string | null;
  busnessName: string | null;
  hauptstandort: string[] | null;
  defaultHauptstandort?: string | null;
  createdAt: string;
  updatedAt: string;
  // Employee specific fields
  accountName?: string;
  employeeName?: string;
  jobPosition?: string | null;
  financialAccess?: boolean;
  partner?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    hauptstandort: string[];
    busnessName: string;
    absenderEmail: string;
    phone: string;
  };
  // Store locations
  storeLocations?: Array<{
    address: string;
    description?: string;
  }>;
  // Account information
  accountInfo?: {
    bankInfo?: {
      bankName: string;
      bankNumber: string;
    };
    barcodeLabel?: string;
    two_factor_auth?: boolean;
    vat_country?: string | null;
    vat_number?: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  validateToken: () => Promise<boolean>;
  isEmployeeMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployeeMode, setIsEmployeeMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  // Validate token on every route change (except login page)
  useEffect(() => {
    if (isInitialized && isAuthenticated && pathname !== '/login') {
      validateToken();
    }
  }, [pathname, isInitialized, isAuthenticated]);

  const validateToken = async (): Promise<boolean> => {
    const employeeToken = localStorage.getItem('employeeToken');
    const mainToken = localStorage.getItem('token');

    if (!mainToken) {
      await forceLogout();
      return false;
    }

    try {
      const response = await userCheckAuth();

      if (response.success) {
        const userData = response.data || response.user;
        
        if (userData) {
          const isEmployeeMode = !!employeeToken && userData.role === 'EMPLOYEE';
          
          setUser(userData);
          setIsAuthenticated(true);
          setIsEmployeeMode(isEmployeeMode);
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (employeeToken) {
          localStorage.removeItem('employeeToken');
          localStorage.removeItem('currentEmployeeId');
          localStorage.removeItem('currentEmployeeData');
          window.location.reload();
        } else {
          await forceLogout();
        }
      }
      return false;
    }
  };

  const forceLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('employeeToken');
      
      setUser(null);
      setIsAuthenticated(false);
      setIsEmployeeMode(false);

      if (pathname !== '/login') {
        router.push('/login');
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const checkAuth = async () => {
    const employeeToken = localStorage.getItem('employeeToken');
    const mainToken = localStorage.getItem('token');

    if (!mainToken) {
      setUser(null);
      setIsAuthenticated(false);
      setIsEmployeeMode(false);
      setIsInitialized(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userCheckAuth();

      if (response.success) {
        const userData = response.data || response.user;
        
        if (userData) {
          const isEmployeeMode = !!employeeToken && userData.role === 'EMPLOYEE';
          
          if (employeeToken && userData.role !== 'EMPLOYEE') {
            localStorage.removeItem('employeeToken');
            localStorage.removeItem('currentEmployeeId');
            localStorage.removeItem('currentEmployeeData');
          }
          
          setUser(userData);
          setIsAuthenticated(true);
          setIsEmployeeMode(isEmployeeMode);
        } else {
          await forceLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (employeeToken) {
          localStorage.removeItem('employeeToken');
          localStorage.removeItem('currentEmployeeId');
          localStorage.removeItem('currentEmployeeData');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          await forceLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (token: string) => {
    try {
      setIsLoading(true);
      localStorage.removeItem('employeeToken');
      localStorage.setItem('token', token);

      const response = await userCheckAuth();

      if (response.success) {
        const userData = response.data || response.user;
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          setIsEmployeeMode(false);
        } else {
          throw new Error('Failed to verify authentication');
        }
      } else {
        throw new Error('Failed to verify authentication');
      }
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('employeeToken');
      
      setUser(null);
      setIsAuthenticated(false);
      setIsEmployeeMode(false);
      router.push('/login');
    } catch (error) {
      // Silent error handling
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated, isLoading, validateToken, isEmployeeMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}