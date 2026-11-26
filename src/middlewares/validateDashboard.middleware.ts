import { RequestHandler } from 'express';

export const validateDashboardSummary: RequestHandler = (_req, _res, next) => {
  next();
};