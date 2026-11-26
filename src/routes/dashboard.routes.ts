import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { validateDashboardSummary } from '../middlewares/validateDashboard.middleware';

const router = Router();

router.get('/summary', validateDashboardSummary, DashboardController.getSummary);

export default router;