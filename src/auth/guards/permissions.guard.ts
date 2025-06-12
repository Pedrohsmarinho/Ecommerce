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
    'manage:categories'
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

    // Verifica se o usuário tem o role ADMIN
    const isAdmin = user.roles === 'ADMIN';
    if (isAdmin) {
      return true; // ADMIN tem todas as permissões
    }

    // Para outros roles, verifica as permissões específicas
    const userRole = user.type;
    const userPermissions = rolePermissions[userRole] || [];

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}