/**
 * Route Permission Utilities
 * 
 * Handles route-based access control for Next.js App Router.
 * If a base route has action: false, all nested/dynamic routes are blocked.
 */

export type RoutePermission = {
  path: string;
  action: boolean;
  nested?: RoutePermission[];
};

export type PermissionMap = Map<string, boolean>;

/**
 * Normalizes a path by removing query params, hash, and trailing slashes
 */
export const normalizePath = (path: string): string => {
  if (!path || path === '/') return '/';
  
  // Remove query parameters and hash
  const withoutQuery = path.split('?')[0].split('#')[0];
  
  // Remove trailing slashes (but keep root as '/')
  const normalized = withoutQuery.replace(/\/+$/, '') || '/';
  
  return normalized;
};

/**
 * Flattens nested permission structure into a Map for O(1) lookups
 * Key: normalized path, Value: action (true/false)
 */
export const flattenPermissions = (permissions: RoutePermission[]): PermissionMap => {
  const map = new Map<string, boolean>();
  
  const flatten = (items: RoutePermission[], parentPath?: string) => {
    for (const item of items) {
      const normalizedPath = normalizePath(item.path);
      
      // Store the permission
      map.set(normalizedPath, item.action);
      
      // Recursively flatten nested permissions
      if (item.nested && item.nested.length > 0) {
        flatten(item.nested, normalizedPath);
      }
    }
  };
  
  flatten(permissions);
  return map;
};

/**
 * Finds all parent routes for a given path
 * Returns array of parent paths sorted by length (longest first)
 * 
 * Example:
 * - Path: /dashboard/custom-shafts/details/123
 * - Parents: ['/dashboard/custom-shafts', '/dashboard']
 */
export const findParentRoutes = (targetPath: string, permissionMap: PermissionMap): string[] => {
  const normalizedTarget = normalizePath(targetPath);
  const parents: string[] = [];
  
  // Check all paths in the permission map
  for (const [permissionPath] of permissionMap) {
    // Skip if it's the exact same path
    if (permissionPath === normalizedTarget) continue;
    
    // Check if target path starts with permission path + '/'
    // This ensures /dashboard/custom-shafts matches /dashboard/custom-shafts/details/123
    // But /dashboard/custom-shafts-other does NOT match /dashboard/custom-shafts
    if (normalizedTarget.startsWith(permissionPath + '/')) {
      parents.push(permissionPath);
    }
  }
  
  // Sort by length (longest first) to get most specific parent first
  return parents.sort((a, b) => b.length - a.length);
};

/**
 * Checks if a route is allowed based on permissions
 * 
 * Logic:
 * 1. Check exact match first
 * 2. Check all parent routes - if ANY parent has action: false, block access
 * 3. If no parent found, deny access (default deny)
 * 
 * @param path - The route path to check
 * @param permissionMap - Map of normalized paths to their action values
 * @returns true if route is allowed, false otherwise
 */
export const isRouteAllowed = (path: string, permissionMap: PermissionMap): boolean => {
  if (!path || permissionMap.size === 0) return false;
  
  const normalizedPath = normalizePath(path);
  
  // Step 1: Check exact match first
  if (permissionMap.has(normalizedPath)) {
    return permissionMap.get(normalizedPath) === true;
  }
  
  // Step 2: Find all parent routes
  const parentRoutes = findParentRoutes(normalizedPath, permissionMap);
  
  // Step 3: Check if ANY parent has action: false
  // If any parent is false, block ALL child routes
  for (const parentPath of parentRoutes) {
    const parentAction = permissionMap.get(parentPath);
    
    // If parent exists and has action: false, block access
    if (parentAction === false) {
      return false;
    }
    
    // If parent exists and has action: true, allow access
    if (parentAction === true) {
      return true;
    }
  }
  
  // Step 4: No matching route found - default deny
  return false;
};

/**
 * Creates a permission checker function optimized for React hooks
 * Memoize this in your context/provider
 */
export const createRoutePermissionChecker = (permissions: RoutePermission[]) => {
  const permissionMap = flattenPermissions(permissions);
  
  return (path: string): boolean => {
    return isRouteAllowed(path, permissionMap);
  };
};

/**
 * Gets the first allowed route from permissions
 * Useful for redirecting users when they don't have access
 */
export const getFirstAllowedRoute = (permissions: RoutePermission[]): string => {
  // Try to find dashboard first
  const dashboard = permissions.find(p => 
    normalizePath(p.path) === '/dashboard' && p.action === true
  );
  
  if (dashboard) return '/dashboard';
  
  // Find first route with action: true
  const firstAllowed = permissions.find(p => p.action === true);
  
  return firstAllowed ? normalizePath(firstAllowed.path) : '/dashboard';
};

// ============================================================================
// Legacy helper functions for employee permissions management
// These are used by the employee settings components
// ============================================================================

import type { IconType } from 'react-icons';
import type { StaticImageData } from 'next/image';
import { RxDashboard } from "react-icons/rx";
import { IoSearchOutline } from 'react-icons/io5';
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { FiUserPlus, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { BsCashStack } from 'react-icons/bs';
import { HiOutlineDocumentText, HiOutlineCube } from 'react-icons/hi';
import { BiNews, BiPackage } from 'react-icons/bi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { TbActivityHeartbeat, TbUsers } from 'react-icons/tb';
import Einlagenauftrag from '@/public/images/dashboard/partner_sidebar/Einlagenaufträge.png';
import Einstellungen from '@/public/images/dashboard/partner_sidebar/Einstellungen.png';
import Fußübungen from '@/public/images/dashboard/partner_sidebar/Fußübungen.png';
import Maßschäfte from '@/public/images/dashboard/partner_sidebar/Maßschäfte.png';
import Maßschuhaufträge from '@/public/images/dashboard/partner_sidebar/Maßschuhaufträge.png';
import Nachrichten from '@/public/images/dashboard/partner_sidebar/Nachrichten.png';
import Terminkalender from '@/public/images/dashboard/partner_sidebar/Terminkalender.png';

/**
 * Map path to icon
 */
export const getIconForPath = (path: string): IconType | StaticImageData => {
  const pathMap: Record<string, IconType | StaticImageData> = {
    '/dashboard': RxDashboard,
    '/dashboard/teamchat': HiOutlineChatBubbleLeftRight,
    '/dashboard/customers': IoSearchOutline,
    '/dashboard/neukundenerstellung': FiUserPlus,
    '/dashboard/orders': Einlagenauftrag,
    '/dashboard/massschuhauftraege': Maßschuhaufträge,
    '/dashboard/custom-shafts': Maßschäfte,
    '/dashboard/lager': HiOutlineCube,
    '/dashboard/group-orders': HiOutlineCube,
    '/dashboard/email/inbox': Nachrichten,
    '/dashboard/calendar': Terminkalender,
    '/dashboard/monatsstatistik': FiBarChart,
    '/dashboard/mitarbeitercontrolling': TbUsers,
    '/dashboard/einlagencontrolling': TbActivityHeartbeat,
    '/dashboard/foot-exercises': Fußübungen,
    '/dashboard/musterzettel': Fußübungen,
    '/dashboard/settings': Einstellungen,
    '/dashboard/news': BiNews,
    '/dashboard/products': BiPackage,
    '/dashboard/balance-dashboard': MdAccountBalanceWallet,
    '/dashboard/automatisierte-nachrichten': HiOutlineChatBubbleLeftRight,
    '/dashboard/kasse': FiDollarSign,
    '/dashboard/finanzen-kasse': BsCashStack,
    '/dashboard/einnahmen': HiOutlineDocumentText,
  };
  
  return pathMap[path] || RxDashboard;
};

/**
 * Convert title to permission key format (lowercase, spaces to underscores, special chars handled)
 */
export const titleToPermissionKey = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/&/g, '_and_')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Map specific titles to their permission keys (based on the example provided)
 */
export const getPermissionKeyForTitle = (title: string): string => {
  const titleMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Teamchat': 'teamchat',
    'Kundensuche': 'kundensuche',
    'Neukundenerstellung': 'neukundenerstellung',
    'Einlagenaufträge': 'einlagenauftrage',
    'Maßschuhaufträge': 'massschuhauftrage',
    'Maßschäfte': 'massschafte',
    'Produktverwaltung': 'produktverwaltung',
    'Sammelbestellungen': 'sammelbestellungen',
    'Nachrichten': 'nachrichten',
    'Terminkalender': 'terminkalender',
    'Monatsstatistik': 'monatsstatistik',
    'Mitarbeitercontrolling': 'mitarbeitercontrolling',
    'Einlagencontrolling': 'einlagencontrolling',
    'Fußübungen': 'fusubungen',
    'Musterzettel': 'musterzettel',
    'Einstellungen': 'einstellungen',
    'News & Aktuelles': 'news_and_aktuelles',
    'Produktkatalog': 'produktkatalog',
    'Balance': 'balance',
    'Einnahmen & Rechnungen': 'einnahmen_and_rechnungen',
    'Finanzen & Kasse': 'finanzen_and_kasse',
    'Kasse & Abholungen': 'kasse_and_abholungen',
    'Automatisierte Nachrichten': 'automatisierte_nachrichten',
    // Nested items for Einstellungen
    'Grundeinstellungen': 'grundeinstellungen',
    'Backup Einstellungen': 'backup_einstellungen',
    'Kundenkommunikation': 'kundenkommunikation',
    'Werkstattzettel': 'werkstattzettel',
    'Benachrichtigungen': 'benachrichtigungen',
    'Lagereinstellungen': 'lagereinstellungen',
    'Preisverwaltung': 'preisverwaltung',
    'Software Scanstation': 'software_scanstation',
    'Design & Logo': 'design_and_logo',
    'Passwort ändern': 'passwort_andern',
    'Sprache': 'sprache',
    'Fragen': 'fragen',
    'Automatische Orders': 'automatische_orders',
  };
  
  return titleMap[title] || titleToPermissionKey(title);
};

/**
 * Reverse mapping: permission key to title
 */
export const getTitleForPermissionKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'teamchat': 'Teamchat',
    'kundensuche': 'Kundensuche',
    'neukundenerstellung': 'Neukundenerstellung',
    'einlagenauftrage': 'Einlagenaufträge',
    'massschuhauftrage': 'Maßschuhaufträge',
    'massschafte': 'Maßschäfte',
    'produktverwaltung': 'Produktverwaltung',
    'sammelbestellungen': 'Sammelbestellungen',
    'nachrichten': 'Nachrichten',
    'terminkalender': 'Terminkalender',
    'monatsstatistik': 'Monatsstatistik',
    'mitarbeitercontrolling': 'Mitarbeitercontrolling',
    'einlagencontrolling': 'Einlagencontrolling',
    'fusubungen': 'Fußübungen',
    'musterzettel': 'Musterzettel',
    'einstellungen': 'Einstellungen',
    'news_and_aktuelles': 'News & Aktuelles',
    'produktkatalog': 'Produktkatalog',
    'balance': 'Balance',
    'einnahmen_and_rechnungen': 'Einnahmen & Rechnungen',
    'finanzen_and_kasse': 'Finanzen & Kasse',
    'kasse_and_abholungen': 'Kasse & Abholungen',
    'automatisierte_nachrichten': 'Automatisierte Nachrichten',
  };
  
  return keyMap[key] || key;
};

/**
 * Get path for permission key
 */
export const getPathForPermissionKey = (key: string): string => {
  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'teamchat': '/dashboard/teamchat',
    'kundensuche': '/dashboard/customers',
    'neukundenerstellung': '/dashboard/neukundenerstellung',
    'einlagenauftrage': '/dashboard/orders',
    'massschuhauftrage': '/dashboard/massschuhauftraege',
    'massschafte': '/dashboard/custom-shafts',
    'produktverwaltung': '/dashboard/lager',
    'sammelbestellungen': '/dashboard/group-orders',
    'nachrichten': '/dashboard/email/inbox',
    'terminkalender': '/dashboard/calendar',
    'monatsstatistik': '/dashboard/monatsstatistik',
    'mitarbeitercontrolling': '/dashboard/mitarbeitercontrolling',
    'einlagencontrolling': '/dashboard/einlagencontrolling',
    'fusubungen': '/dashboard/foot-exercises',
    'musterzettel': '/dashboard/musterzettel',
    'einstellungen': '/dashboard/settings',
    'news_and_aktuelles': '/dashboard/news',
    'produktkatalog': '/dashboard/products',
    'balance': '/dashboard/balance-dashboard',
    'automatisierte_nachrichten': '/dashboard/automatisierte-nachrichten',
    'kasse_and_abholungen': '/dashboard/kasse',
    'finanzen_and_kasse': '/dashboard/finanzen-kasse',
    'einnahmen_and_rechnungen': '/dashboard/einnahmen',
  };
  
  return pathMap[key] || '/dashboard';
};

/**
 * Build features list from permissions keys (for edit mode)
 */
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

export const buildFeaturesFromPermissions = (permissions: Record<string, boolean>): FeatureItem[] => {
  return Object.keys(permissions).map(key => ({
    title: getTitleForPermissionKey(key),
    action: true,
    path: getPathForPermissionKey(key),
    nested: []
  }));
};
