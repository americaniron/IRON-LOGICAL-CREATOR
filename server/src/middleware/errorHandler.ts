import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import config from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with full details
  logger.error('Application error', {
    error: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';

  // In production, don't leak error details
  const message = config.env === 'production' && statusCode === 500
    ? 'An internal error occurred'
    : err.message;

  res.status(statusCode).json({
    error: code || 'ERROR',
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'The requested resource was not found',
    path: req.path,
  });
};

// Async route handler wrapper to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
