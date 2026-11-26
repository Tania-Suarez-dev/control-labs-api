import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import {
  validateLoanIdParameter,
  validateLoanPayload,
  validateLoanSearchQuery
} from '../middlewares/validateLoan.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('GUARDA'), validateLoanPayload, LoanController.createLoan);

router.get(
  '/search',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateLoanSearchQuery,
  LoanController.getLoansByFilter
);

router.get(
  '/:id',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateLoanIdParameter,
  LoanController.getLoanById
);

router.put(
  '/:id/accept',
  authorize('INSTRUCTOR'),
  validateLoanIdParameter,
  LoanController.acceptLoanInventory
);

export default router;