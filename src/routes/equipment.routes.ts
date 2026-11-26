import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  validateCreateEquipmentPayload,
  validateEquipmentIdParameter,
  validateEquipmentSearchQuery,
  validateMoveEquipmentPayload,
  validateUpdateEquipmentPayload
} from '../middlewares/validateEquipment.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validateEquipmentSearchQuery, EquipmentController.getEquipment);
router.post(
  '/',
  authorize('ADMIN'),
  validateCreateEquipmentPayload,
  EquipmentController.createEquipment
);
router.patch(
  '/:id',
  authorize('ADMIN'),
  validateEquipmentIdParameter,
  validateUpdateEquipmentPayload,
  EquipmentController.updateEquipment
);
router.post(
  '/:id/move',
  authorize('ADMIN', 'GUARDA'),
  validateEquipmentIdParameter,
  validateMoveEquipmentPayload,
  EquipmentController.moveEquipment
);

export default router;
