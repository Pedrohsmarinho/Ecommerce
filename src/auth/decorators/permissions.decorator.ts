import { SetMetadata } from '@nestjs/common';

export type Permission =
  | 'create:product'
  | 'read:product'
  | 'update:product'
  | 'delete:product'
  | 'manage:users'
  | 'manage:orders'
  | 'view:orders'
  | 'manage:categories';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions); 