import { Router } from 'express';
import { getUserProfile, verifyUserEmail, resendVerification } from '../controllers/UserController';
import { emailVerificationSchema } from '../dtos/EmailVerificationDTO';
import { resendVerificationSchema } from '../dtos/ResendVerificationDTO';
import { validate } from '../middlewares/validation';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/verify-email', validate(emailVerificationSchema), verifyUserEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);

// Protected routes
router.get('/me', authMiddleware, getUserProfile);

export default router;