import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/AuthService';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Access token is required' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      res.status(401).json({ error: 'Access token is required' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

// Role-based middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.type)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['ADMIN']);

// Client or Admin middleware
export const requireClientOrAdmin = requireRole(['CLIENT', 'ADMIN']);