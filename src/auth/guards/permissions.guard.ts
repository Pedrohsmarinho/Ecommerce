import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { PERMISSIONS_KEY, Permission } from '../decorators/permissions.decorator';

const rolePermissions: Record<UserType, Permission[]> = {
  ADMIN: [
    'create:product',
    'read:product',
    'update:product',
    'delete:product',
    'manage:users',
    'manage:orders',
    'view:orders',
    'manage:categories',
    'manage:clients',
    'create:user',
    'update:user',
    'delete:user',
    'view:users',
    'manage:all'
  ],
  CLIENT: [
    'read:product',
    'view:orders'
  ]
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Admin has unrestricted access to everything
    if (user.type === UserType.ADMIN) {
      return true;
    }

    // For other roles, check specific permissions
    const userRole = user.type;
    const userPermissions = rolePermissions[userRole] || [];

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}