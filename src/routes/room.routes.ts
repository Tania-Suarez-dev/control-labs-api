import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validateCreateRoomPayload,
  validateRoomIdParameter,
  validateUpdateRoomPayload
} from '../middlewares/validateRoom.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  RoomController.getRooms
);

router.get(
  '/:id',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateRoomIdParameter,
  RoomController.getRoomById
);

router.post(
  '/',
  authorize('ADMIN'),
  validateCreateRoomPayload,
  RoomController.createRoom
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validateRoomIdParameter,
  validateUpdateRoomPayload,
  RoomController.updateRoom
);

export default router;
