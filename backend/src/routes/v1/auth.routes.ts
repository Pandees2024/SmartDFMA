import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, refreshTokenSchema } from '../../validators/auth.validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// POST /api/UserApi/Authorization — matches original .NET API
router.post('/UserApi/Authorization', validate(loginSchema), authController.login);
// Modern auth routes
router.post('/auth/login', validate(loginSchema), authController.login);
router.post('/auth/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/me', authMiddleware, authController.me);

export default router;
