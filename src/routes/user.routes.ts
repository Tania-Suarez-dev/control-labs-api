import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateCreateUserPayload } from '../middlewares/validateUser.middlewares';
 
const router = Router();
 
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', validateCreateUserPayload, UserController.createUser);
router.patch('/:id', UserController.updateUserRole);
router.patch('/:id/delete', UserController.deleteUser);
 
export default router;
 