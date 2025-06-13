import { SetMetadata } from '@nestjs/common';

export type Permission =
  | 'create:product'
  | 'read:product'
  | 'update:product'
  | 'delete:product'
  | 'manage:users'
  | 'manage:orders'
  | 'view:orders'
  | 'manage:categories'
  | 'manage:clients'
  | 'create:user'
  | 'update:user'
  | 'delete:user'
  | 'view:users'
  | 'manage:all';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);