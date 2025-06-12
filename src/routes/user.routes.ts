import { Router } from 'express';
import { registerUser, getUserProfile } from '../controllers/UserController';
import { createUserSchema } from '../dtos/CreateUserDTO';
import { validate } from '../middlewares/validation';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', validate(createUserSchema), registerUser);

// Protected routes
router.get('/me', authMiddleware, getUserProfile);

export default router;