"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllDynamicRoutes } from "@/apis/dynamicApis";

const COOKIE_NAME = "td_feature_access_config";

type FeatureItem = {
  title: string;
  action: boolean;
  path: string;
  nested?: {
    title: string;
    path: string;
    action: boolean;
  }[];
};

type FeatureAccessResponse = {
  success: boolean;
  message: string;
  data: FeatureItem[];
};

type FeatureAccessContextType = {
  loading: boolean;
  features: FeatureItem[];
  isPathAllowed: (path: string) => boolean;
  getNestedForPath: (parentPath: string) => FeatureItem["nested"];
};

// Improved path normalization - handles query params and trailing slashes
const normalizePath = (value: string): string => {
  // Remove query parameters and hash
  const pathWithoutQuery = value.split('?')[0].split('#')[0];
  // Remove trailing slashes
  return pathWithoutQuery.replace(/\/+$/, "") || "/";
};

// Sync features to cookie for middleware access
const syncFeaturesToCookie = (features: FeatureItem[]) => {
  if (typeof document === "undefined") return;
  
  try {
    const cookieValue = JSON.stringify({
      features,
      updatedAt: Date.now(),
    });
    
    // Set cookie with proper attributes
    // Max age: 7 days (same as typical session)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to sync features to cookie:", error);
  }
};

const FeatureAccessContext = createContext<FeatureAccessContextType | undefined>(undefined);

export const FeatureAccessProvider = ({ children }: { children: React.ReactNode }) => {
  // Start with empty array - always fetch fresh data from API
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined" || features.length === 0) return;
    syncFeaturesToCookie(features);
  }, [features]);

  useEffect(() => {
    let isMounted = true;

    const fetchFeatures = async () => {
      try {
        setLoading(true);
        const res = (await getAllDynamicRoutes()) as FeatureAccessResponse;
        
        if (!isMounted) return;
        
        if (!res?.success || !Array.isArray(res.data)) {
          setLoading(false);
          return;
        }

        // Set features from API immediately (real-time data)
        setFeatures(res.data);
        setLoading(false);

        // Sync to cookie for middleware access (if needed)
        syncFeaturesToCookie(res.data);
      } catch (error) {
        console.error("Failed to load feature access configuration", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Always fetch fresh data from API on mount
    fetchFeatures();

    return () => {
      isMounted = false;
    };
  }, []);

  const isPathAllowed = useMemo(
    () =>
      (path: string) => {
        if (!features || features.length === 0) return false;

        const target = normalizePath(path);

        // Check exact matches first (most important - blocks routes with action: false)
        for (const item of features) {
          const itemPath = normalizePath(item.path);
          if (itemPath === target) return item.action;

          if (item.nested?.length) {
            for (const nested of item.nested) {
              const nestedPath = normalizePath(nested.path);
              if (nestedPath === target) {
                return nested.action && item.action;
              }
            }
          }
        }

        // Check parent routes only if no exact match found
        for (const item of features) {
          if (item.nested?.length) {
            for (const nested of item.nested) {
              const nestedPath = normalizePath(nested.path);
              if (target.startsWith(nestedPath + '/') || target.startsWith(nestedPath + '?')) {
                if (!nested.action || !item.action) return false;
              }
            }
          }

          const itemPath = normalizePath(item.path);
          if (target.startsWith(itemPath + '/') || target.startsWith(itemPath + '?')) {
            if (!item.action) return false;
            return true;
          }
        }

        return false;
      },
    [features]
  );

  const getNestedForPath = useMemo(
    () =>
      (parentPath: string): FeatureItem["nested"] => {
        const target = normalizePath(parentPath);
        const item = features.find((f) => normalizePath(f.path) === target);
        return item?.nested ?? [];
      },
    [features]
  );

  const value: FeatureAccessContextType = {
    loading,
    features,
    isPathAllowed,
    getNestedForPath,
  };

  return (
    <FeatureAccessContext.Provider value={value}>
      {children}
    </FeatureAccessContext.Provider>
  );
};

export const useFeatureAccess = () => {
  const ctx = useContext(FeatureAccessContext);
  if (!ctx) {
    throw new Error("useFeatureAccess must be used within a FeatureAccessProvider");
  }
  return ctx;
};

export const useCurrentRouteAccess = () => {
  const { isPathAllowed, loading, features } = useFeatureAccess();
  const pathname = usePathname();

  return {
    loading,
    allowed: features.length === 0 ? false : (pathname ? isPathAllowed(pathname) : false),
  };
};

