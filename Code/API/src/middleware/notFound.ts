import { Request, Response } from 'express';
import { ErrorResponse } from '../types/ErrorResponse';

export const notFound = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    statusCode: 404,
  };

  res.status(404).json(errorResponse);
};
