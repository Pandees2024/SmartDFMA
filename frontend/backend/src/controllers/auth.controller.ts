import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendLegacy, sendSuccess, sendError } from '../utils/response.helper';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  // POST /api/UserApi/Authorization — matches original .NET API endpoint
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { Username, Password } = req.body;
      const result = await authService.login(Username, Password);

      // Match original API response format exactly
      res.status(200).json({
        Type: 'S',
        Message: 'Login successfully',
        AdditionalData: {
          User: result.user,
        },
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      sendSuccess(res, tokens, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, req.user, 'Current user');
    } catch (error) {
      next(error);
    }
  },
};
