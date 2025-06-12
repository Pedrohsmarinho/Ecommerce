import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// Test route for admin only
router.get('/admin-only',
  authenticate,
  requireRole(['ADMIN']),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

// Test route for sellers
router.get('/seller-only',
  authenticate,
  requireRole(['SELLER', 'ADMIN']),
  (req, res) => {
    res.json({ message: 'Seller access granted' });
  }
);

// Test route for product creation permission
router.post('/test-product',
  authenticate,
  requirePermission(['create:product']),
  (req, res) => {
    res.json({ message: 'Product creation permission granted' });
  }
);

// Test route for user management permission
router.get('/users',
  authenticate,
  requirePermission(['manage:users']),
  (req, res) => {
    res.json({ message: 'User management permission granted' });
  }
);

export default router;