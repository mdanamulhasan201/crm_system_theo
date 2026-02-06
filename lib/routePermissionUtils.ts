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
