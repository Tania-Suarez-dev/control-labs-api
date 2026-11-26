import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import {
  validateCreateEquipmentPayload,
  validateEquipmentIdParameter,
  validateEquipmentSearchQuery,
  validateUpdateEquipmentPayload
} from '../middlewares/validateEquipment.middleware';

const router = Router();

router.get('/', validateEquipmentSearchQuery, EquipmentController.getEquipment);
router.post('/', validateCreateEquipmentPayload, EquipmentController.createEquipment);
router.patch('/:id', validateEquipmentIdParameter, validateUpdateEquipmentPayload, EquipmentController.updateEquipment);

export default router;