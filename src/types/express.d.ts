import { JwtPayload } from '../services/AuthService';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}