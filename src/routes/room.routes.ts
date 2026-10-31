import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import {validateCreateRoomPayload} from '../middlewares/validateRoom.middleware';

const router = Router();
 
router.get('/', RoomController.getRooms);
router.post('/', validateCreateRoomPayload, RoomController.createRoom);
router.patch('/:id', RoomController.updateRoom);
 
export default router;
 

