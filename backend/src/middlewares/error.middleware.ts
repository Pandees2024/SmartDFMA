import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.helper';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: AppError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma errors
  if (err.message.includes('Unique constraint')) {
    sendError(res, 'A record with this data already exists', 409);
    return;
  }

  if (err.message.includes('Record to delete does not exist')) {
    sendError(res, 'Record not found', 404);
    return;
  }

  sendError(res, 'Internal server error', 500);
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.url} not found`, 404);
};
