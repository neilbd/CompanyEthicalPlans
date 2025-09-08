import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/ErrorResponse';

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

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  console.error(`Error ${statusCode}: ${message}`, error.stack);

  const errorResponse: ErrorResponse = {
    success: false,
    error: error.name,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'Internal Server Error';
  }

  res.status(statusCode).json(errorResponse);
};
