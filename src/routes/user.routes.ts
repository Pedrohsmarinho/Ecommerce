import { Router } from 'express';
import { registerUser } from '../controllers/UserController';
import { createUserSchema } from '../dtos/CreateUserDTO';
import { validate } from '../middlewares/validation';

const router = Router();
router.post('/register', validate(createUserSchema), registerUser);

export default router;