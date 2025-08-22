// app/lib/auth/rbac-server.ts
import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { api } from '../../../convex/_generated/api';
import { Role, Permission, rolePermissions, UserWithRole } from './rbac';
import { getConvexClient } from '../convex/client';

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // During build time, skip Convex operations and return basic user info
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl || convexUrl.trim() === '' || convexUrl.includes('dummy-build-url')) {
      console.warn('Convex URL not available during build, using fallback user info');
      const permissions = rolePermissions[Role.CUSTOMER];
      return {
        id: userId,
        email: '',
        role: Role.CUSTOMER,
        permissions,
      };
    }

    // Get user from Convex database
    try {
      const convex = getConvexClient();
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (convexUser) {
        const userRole = convexUser.role as Role;
        const permissions = rolePermissions[userRole] || rolePermissions[Role.CUSTOMER];

        return {
          id: userId,
          email: convexUser.email,
          role: userRole,
          permissions,
          convexUserId: convexUser._id,
        };
      }
    } catch (convexError) {
      console.warn('Could not fetch user from Convex:', convexError);
      // Check if this is a build-time or deployment address error
      if (convexError instanceof Error && convexError.message.includes('deployment address')) {
        console.warn('Build-time Convex error, using fallback');
        const permissions = rolePermissions[Role.CUSTOMER];
        return {
          id: userId,
          email: '',
          role: Role.CUSTOMER,
          permissions,
        };
      }
    }

    // Fallback to default role if user not found in Convex
    const permissions = rolePermissions[Role.CUSTOMER];

    return {
      id: userId,
      email: '',
      role: Role.CUSTOMER,
      permissions,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  // Admin has access to everything
  if (userRole === Role.ADMIN) return true;
  
  // Exact role match
  return userRole === requiredRole;
}

export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  // Admin has access to everything
  if (userRole === Role.ADMIN) return true;
  
  return requiredRoles.includes(userRole);
}

// Middleware helper for API route protection
export async function requirePermission(permission: Permission): Promise<UserWithRole> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!hasPermission(user.permissions, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
  
  return user;
}

export async function requireRole(role: Role): Promise<UserWithRole> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!hasRole(user.role, role)) {
    throw new Error(`Access denied: ${role} role required`);
  }
  
  return user;
}

export async function requireAnyRole(roles: Role[]): Promise<UserWithRole> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!hasAnyRole(user.role, roles)) {
    throw new Error(`Access denied: One of [${roles.join(', ')}] roles required`);
  }
  
  return user;
}
