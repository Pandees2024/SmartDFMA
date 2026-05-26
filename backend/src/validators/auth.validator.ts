import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    Username: z.string().min(1, 'Username is required'),
    Password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
