import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('User in guard:', user); // Debug log
    console.log('Required roles:', requiredRoles); // Debug log
    console.log('User type:', user?.type); // Debug log
    console.log('Is allowed:', requiredRoles.some((role) => user?.type === role)); // Debug log

    return requiredRoles.some((role) => user?.type === role);
  }
}