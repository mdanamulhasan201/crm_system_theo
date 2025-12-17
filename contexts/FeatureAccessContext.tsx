"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllDynamicRoutes } from "@/apis/dynamicApis";

const STORAGE_KEY = "td_feature_access_config";

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

const normalizePath = (value: string) => value.replace(/\/+$/, "");

const FeatureAccessContext = createContext<FeatureAccessContextType | undefined>(undefined);

export const FeatureAccessProvider = ({ children }: { children: React.ReactNode }) => {
  const [features, setFeatures] = useState<FeatureItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { features?: FeatureItem[] };
      return Array.isArray(parsed.features) ? parsed.features : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFeatures = async () => {
      try {
        setLoading(true);
        const res = (await getAllDynamicRoutes()) as FeatureAccessResponse;
        if (!isMounted || !res?.success || !Array.isArray(res.data)) return;

        setFeatures(res.data);

        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              features: res.data,
              updatedAt: Date.now(),
            })
          );
        } catch {
          // ignore storage errors
        }
      } catch (error) {
        console.error("Failed to load feature access configuration", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeatures();

    return () => {
      isMounted = false;
    };
  }, []);

  const isPathAllowed = useMemo(
    () =>
      (path: string) => {
        if (!features.length) return true;

        const target = normalizePath(path);

        for (const item of features) {
          if (normalizePath(item.path) === target) return item.action;

          if (item.nested) {
            for (const nested of item.nested) {
              if (normalizePath(nested.path) === target) return nested.action;
            }
          }
        }

        return true;
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
  const { isPathAllowed, loading } = useFeatureAccess();
  const pathname = usePathname();

  return {
    loading,
    allowed: pathname ? isPathAllowed(pathname) : true,
  };
};

