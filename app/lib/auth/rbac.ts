// app/lib/auth/rbac.ts
import { auth, useUser } from '@clerk/nextjs/server';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { Id } from '../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export enum Role {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  OPS = 'ops',
  ADMIN = 'admin',
}

export enum Permission {
  // User permissions
  CREATE_QUOTE = 'create_quote',
  VIEW_OWN_BOOKINGS = 'view_own_bookings',
  TRACK_SHIPMENT = 'track_shipment',
  UPLOAD_DOCUMENTS = 'upload_documents',
  
  // Ops permissions
  VIEW_ALL_BOOKINGS = 'view_all_bookings',
  UPDATE_BOOKING_STATUS = 'update_booking_status',
  VIEW_OPERATIONS_DASHBOARD = 'view_operations_dashboard',
  MANAGE_DISPATCH = 'manage_dispatch',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_RATES = 'manage_rates',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM_CONFIG = 'manage_system_config',
  ACCESS_ADMIN_DASHBOARD = 'access_admin_dashboard',
  
  // Support permissions
  VIEW_CUSTOMER_DATA = 'view_customer_data',
  MODIFY_BOOKINGS = 'modify_bookings',
  ACCESS_SUPPORT_TOOLS = 'access_support_tools',
}

// Define base permissions for each role
const customerPermissions = [
  Permission.CREATE_QUOTE,
  Permission.VIEW_OWN_BOOKINGS,
  Permission.TRACK_SHIPMENT,
  Permission.UPLOAD_DOCUMENTS,
];

const agentPermissions = [
  ...customerPermissions,
  Permission.VIEW_CUSTOMER_DATA,
  Permission.MODIFY_BOOKINGS,
  Permission.ACCESS_SUPPORT_TOOLS,
  Permission.VIEW_ALL_BOOKINGS,
];

const opsPermissions = [
  ...agentPermissions,
  Permission.UPDATE_BOOKING_STATUS,
  Permission.VIEW_OPERATIONS_DASHBOARD,
  Permission.MANAGE_DISPATCH,
];

const adminPermissions = Object.values(Permission);

// Define role-permission mappings
const rolePermissions: Record<Role, Permission[]> = {
  [Role.CUSTOMER]: customerPermissions,
  [Role.AGENT]: agentPermissions,
  [Role.OPS]: opsPermissions,
  [Role.ADMIN]: adminPermissions,
};

export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  convexUserId?: Id<'users'>;
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const { userId, user } = await auth();
    
    if (!userId || !user) {
      return null;
    }

    // Get user from Convex database
    try {
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (convexUser) {
        const permissions = rolePermissions[convexUser.role] || rolePermissions[Role.CUSTOMER];

        return {
          id: userId,
          email: convexUser.email,
          role: convexUser.role,
          permissions,
          convexUserId: convexUser._id,
        };
      }
    } catch (convexError) {
      console.warn('Could not fetch user from Convex:', convexError);
    }

    // Fallback to Clerk data with default role
    const userRole = (user.publicMetadata?.role as Role) || Role.CUSTOMER;
    const permissions = rolePermissions[userRole] || rolePermissions[Role.CUSTOMER];

    return {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      role: userRole,
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

// React hook for client-side permission checks
export function usePermissions() {
  // This would typically use Clerk's useUser hook
  // For now, return a placeholder that works with SSR
  return {
    hasPermission: (permission: Permission) => {
      // TODO: Implement client-side permission checking
      // This would need to be connected to Clerk's user context
      return true; // Placeholder
    },
    hasRole: (role: Role) => {
      // TODO: Implement client-side role checking
      return true; // Placeholder
    },
    user: null as UserWithRole | null,
    loading: false,
  };
}

// Route protection helpers
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function createPermissionError(permission: Permission): AuthError {
  return new AuthError(
    `Permission denied: ${permission} required`,
    403,
    'FORBIDDEN'
  );
}

export function createRoleError(role: Role): AuthError {
  return new AuthError(
    `Access denied: ${role} role required`,
    403,
    'FORBIDDEN'
  );
}

// API route wrapper for permission checking
export function withPermission<T extends any[]>(
  permission: Permission,
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      await requirePermission(permission);
      return handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = error.message.includes('Authentication required') ? 401 : 403;
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

export function withRole<T extends any[]>(
  role: Role,
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      await requireRole(role);
      return handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = error.message.includes('Authentication required') ? 401 : 403;
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}