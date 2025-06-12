import { UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        sub: string;
        roles: string[];
        type: UserType;
      };
    }
  }
}

export {};