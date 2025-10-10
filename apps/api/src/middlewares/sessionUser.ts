import { Request, Response, NextFunction, RequestHandler } from 'express';

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
      req.auth = req.user as Express.User;
    }
  } catch (error) {
    console.warn('attached Error:', error);
  }
  next();
};
