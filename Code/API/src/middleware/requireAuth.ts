import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Reject requests that don't carry an authenticated session.
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.session.userId) {
    throw new AppError('Authentication required', 401);
  }
  next();
};
