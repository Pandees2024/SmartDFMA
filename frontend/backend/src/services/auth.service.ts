import { authDao } from '../dao/auth.dao';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.helper';
import { AppError } from '../middlewares/error.middleware';

export const authService = {
  async login(username: string, password: string) {
    const user = await authDao.findUserByCredentials(username, password);
    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await authDao.updateRefreshToken(user.id, refreshToken);

    // Build user response matching original API format
    const userResponse = {
      id: user.id,
      user_name: user.username,
      Name: user.name,
      Username: user.username,
      Token: accessToken,
      api_token: accessToken,
      landing_page: user.landing_page || '/Admin/Dashboard',
      role: user.role,
      team_id: user.team_id,
      is_leader: user.is_leader,
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  },

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await authDao.findUserByRefreshToken(token);
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);
    await authDao.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  },

  async logout(userId: number) {
    await authDao.updateRefreshToken(userId, null);
  },
};
