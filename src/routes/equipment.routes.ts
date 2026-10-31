import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { validateCreateEquipmentPayload } from '../middlewares/validateEquipment.middleware';
 
const router = Router();
 
router.get('/', EquipmentController.getEquipment);
router.post('/', validateCreateEquipmentPayload, EquipmentController.createEquipment);
router.patch('/:id', EquipmentController.updateEquipment);
 
export default router;
 