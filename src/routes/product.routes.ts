import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../dtos/ProductDTO';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/ProductController';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post(
  '/',
  authenticate,
  requirePermission(['create:product']),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  requirePermission(['update:product']),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(['delete:product']),
  deleteProduct
);

export default router;