import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';

// Define role types
export type UserRole = 'ADMIN' | 'USER' | 'SELLER';

// Define permission types
export type Permission =
  | 'create:product'
  | 'read:product'
  | 'update:product'
  | 'delete:product'
  | 'manage:users'
  | 'manage:orders'
  | 'view:orders'
  | 'manage:categories';

// Define role permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'create:product',
    'read:product',
    'update:product',
    'delete:product',
    'manage:users',
    'manage:orders',
    'view:orders',
    'manage:categories'
  ],
  SELLER: [
    'create:product',
    'read:product',
    'update:product',
    'delete:product',
    'view:orders'
  ],
  USER: [
    'read:product',
    'view:orders'
  ]
};

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

// Middleware to check if user has required role
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.type as UserRole)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Middleware to check if user has required permission
export const requirePermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userRole = req.user.type as UserRole;
    const userPermissions = rolePermissions[userRole] || [];

    const hasPermission = permissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Helper function to check if user has specific permission
export const hasPermission = (user: User, permission: Permission): boolean => {
  const userRole = user.type as UserRole;
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(permission);
};