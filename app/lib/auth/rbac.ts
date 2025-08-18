// app/lib/auth/rbac.ts
import { Id } from '../../../convex/_generated/dataModel';

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

// Export rolePermissions for use in client components
export { rolePermissions };

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

// Note: Server-side route wrappers moved to rbac-server.ts