import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validateDashboardSummary } from '../middlewares/validateDashboard.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', validateDashboardSummary, DashboardController.getSummary);

export default router;
