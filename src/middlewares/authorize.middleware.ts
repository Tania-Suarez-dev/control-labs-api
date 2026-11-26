import { RequestHandler } from 'express';
import { UserRole } from '../dtos/user.dtos';

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ success: false, code: 'FORBIDDEN' });
      return;
    }
    next();
  };