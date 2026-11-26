import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  validateCreateRoomPayload,
  validateRoomIdParameter,
  validateUpdateRoomPayload
} from '../middlewares/validateRoom.middleware';

const router = Router();

router.use(authenticate);

router.get('/', RoomController.getRooms);
router.post('/', authorize('ADMIN'), validateCreateRoomPayload, RoomController.createRoom);
router.patch(
  '/:id',
  authorize('ADMIN'),
  validateRoomIdParameter,
  validateUpdateRoomPayload,
  RoomController.updateRoom
);

export default router;
