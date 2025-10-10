// apps/api/src/middlewares/ensureAuth.ts
import { RequestHandler } from 'express';

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  // passport adds isAuthenticated()
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ ok: false, message: 'Unauthorized' });
};
