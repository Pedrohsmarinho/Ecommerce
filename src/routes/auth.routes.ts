import { Router } from 'express';
import { loginUser, verifyUserToken, registerUser } from '../controllers/AuthController';
import { validate } from '../middlewares/validation';
import { loginRequestSchema } from '../dtos/LoginRequestDTO';
import { tokenVerificationSchema } from '../dtos/TokenVerificationDTO';
import { registerRequestSchema } from '../dtos/RegisterRequestDTO';

const router = Router();

// POST /auth/register - User registration
router.post('/register', validate(registerRequestSchema), registerUser);

// POST /auth/login - User login
router.post('/login', validate(loginRequestSchema), loginUser);

// POST /auth/verify - Token verification
router.post('/verify', validate(tokenVerificationSchema), verifyUserToken);

export default router;