// app/lib/auth/usePermissions.ts
'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Role, Permission, rolePermissions, UserWithRole } from './rbac';

export function usePermissions() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  
  // Query Convex for user data
  const convexUser = useQuery(
    api.functions.users.getUserByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  const loading = !clerkLoaded || (clerkUser && convexUser === undefined);

  // Determine user role and permissions
  const getUserData = (): UserWithRole | null => {
    if (!clerkUser || !clerkLoaded) return null;

    let role: Role = Role.CUSTOMER;
    let permissions: Permission[] = rolePermissions[Role.CUSTOMER];

    if (convexUser) {
      // Use Convex user data if available
      role = convexUser.role;
      permissions = rolePermissions[role] || rolePermissions[Role.CUSTOMER];
    } else if (clerkUser.publicMetadata?.role) {
      // Fallback to Clerk metadata
      role = clerkUser.publicMetadata.role as Role;
      permissions = rolePermissions[role] || rolePermissions[Role.CUSTOMER];
    }

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      role,
      permissions,
      convexUserId: convexUser?._id,
    };
  };

  const userData = getUserData();

  const hasPermission = (permission: Permission): boolean => {
    if (!userData) return false;
    return userData.permissions.includes(permission);
  };

  const hasRole = (requiredRole: Role): boolean => {
    if (!userData) return false;
    
    // Admin has access to everything
    if (userData.role === Role.ADMIN) return true;
    
    return userData.role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: Role[]): boolean => {
    if (!userData) return false;
    
    // Admin has access to everything
    if (userData.role === Role.ADMIN) return true;
    
    return requiredRoles.includes(userData.role);
  };

  return {
    user: userData,
    loading,
    hasPermission,
    hasRole,
    hasAnyRole,
    // Convenience methods for common checks
    isAdmin: userData?.role === Role.ADMIN,
    isOps: userData?.role === Role.OPS,
    isAgent: userData?.role === Role.AGENT,
    isCustomer: userData?.role === Role.CUSTOMER,
  };
}

// Component wrapper for permission-based rendering
export function WithPermission({ 
  permission, 
  children, 
  fallback = null 
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = usePermissions();
  
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

// Component wrapper for role-based rendering
export function WithRole({ 
  role, 
  children, 
  fallback = null 
}: {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasRole, hasAnyRole } = usePermissions();
  
  const hasAccess = Array.isArray(role) ? hasAnyRole(role) : hasRole(role);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}