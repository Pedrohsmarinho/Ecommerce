import { CustomJwtPayload } from '../../services/AuthService';

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}