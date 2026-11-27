import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateDashboardSummary } from '../middlewares/validateDashboard.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/summary',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateDashboardSummary,
  DashboardController.getSummary
);

export default router;
