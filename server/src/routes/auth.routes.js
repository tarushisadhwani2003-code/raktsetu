import { Router } from 'express';
import { forgotPassword, login, logout, me, register, resetPassword } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '../validators/auth.schemas.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);

export default router;
