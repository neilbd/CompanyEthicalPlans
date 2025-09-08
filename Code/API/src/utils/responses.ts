import { Response } from 'express';
import { ApiResponse } from '../types/ApiResponse';
import { ErrorResponse } from '../types/ErrorResponse';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
): void => {
  const response: ErrorResponse = {
    success: false,
    error: message,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  res.status(statusCode).json(response);
};
