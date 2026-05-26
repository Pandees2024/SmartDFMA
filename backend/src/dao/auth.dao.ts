import prisma from "../config/database";
import bcrypt from "bcryptjs";

export interface LoginCredentials {
  Username: string;
  Password: string;
}

export const authDao = {
  async findUserByCredentials(username: string, password: string) {
    // First check plain text (legacy compatibility with original .NET app)
    const userPlain = await prisma.user.findFirst({
      where: {
        username: username,
        status: true,
      },
      include: { team: true },
    });

    if (!userPlain) return null;

    // Try bcrypt first, fallback to plain text (for seeded admin)
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, userPlain.password_hash);
    } catch {
      // If bcrypt fails, try plain text match (for legacy/seed data)
      passwordMatch = userPlain.password_hash === password;
    }

    if (!passwordMatch) return null;
    return userPlain;
  },

  async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        team_id: true,
        is_leader: true,
        landing_page: true,
        status: true,
      },
    });
  },

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  },

  async findUserByRefreshToken(refreshToken: string) {
    return prisma.user.findFirst({
      where: { refresh_token: refreshToken, status: true },
    });
  },
};
