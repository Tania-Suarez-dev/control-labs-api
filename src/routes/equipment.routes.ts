import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validateCreateEquipmentPayload,
  validateEquipmentIdParameter,
  validateEquipmentSearchQuery,
  validateMoveEquipmentPayload,
  validateUpdateEquipmentPayload
} from '../middlewares/validateEquipment.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateEquipmentSearchQuery,
  EquipmentController.getEquipment
);

router.patch(
  '/:id/move',
  authorize('ADMIN', 'GUARDA'),
  validateEquipmentIdParameter,
  validateMoveEquipmentPayload,
  EquipmentController.moveEquipment
);

router.get(
  '/:id',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateEquipmentIdParameter,
  EquipmentController.getEquipmentById
);

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

export default router;
