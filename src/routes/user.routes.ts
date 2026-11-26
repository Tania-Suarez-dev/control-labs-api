import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  validateCreateUserPayload,
  validateUpdateUserRolePayload,
  validateUserIdParameter,
  validateUserSearchQuery
} from '../middlewares/validateUser.middleware';

const router = Router();

router.get('/', validateUserSearchQuery, UserController.getUsers);
router.get('/:id', validateUserIdParameter, UserController.getUserById);
router.post('/', validateCreateUserPayload, UserController.createUser);
router.patch('/:id', validateUserIdParameter, validateUpdateUserRolePayload, UserController.updateUserRole);
router.patch('/:id/delete', validateUserIdParameter, UserController.deleteUser);

export default router;