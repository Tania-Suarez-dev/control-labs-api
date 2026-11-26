import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  validateLoanIdParameter,
  validateLoanPayload,
  validateLoanSearchQuery
} from '../middlewares/validateLoan.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'GUARDA'),
  validateLoanPayload,
  LoanController.createLoan
);
router.get('/search', validateLoanSearchQuery, LoanController.getLoansByFilter);
router.get('/:id', validateLoanIdParameter, LoanController.getLoanById);
router.put(
  '/:id/accept',
  authorize('ADMIN', 'GUARDA'),
  validateLoanIdParameter,
  LoanController.acceptLoanInventory
);
router.put(
  '/:id/return',
  authorize('ADMIN', 'GUARDA'),
  validateLoanIdParameter,
  LoanController.returnLoan
);

export default router;
