import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validateCreateUserPayload,
  validateUpdateUserActivePayload,
  validateUpdateUserRolePayload,
  validateUserIdParameter,
  validateUserSearchQuery
} from '../middlewares/validateUser.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), validateUserSearchQuery, UserController.getUsers);

router.get('/:id', authorize('ADMIN'), validateUserIdParameter, UserController.getUserById);

router.post('/', authorize('ADMIN'), validateCreateUserPayload, UserController.createUser);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validateUserIdParameter,
  validateUpdateUserRolePayload,
  UserController.updateUserRole
);

router.patch(
  '/:id/active',
  authorize('ADMIN'),
  validateUserIdParameter,
  validateUpdateUserActivePayload,
  UserController.setActiveState
);

router.patch(
  '/:id/delete',
  authorize('ADMIN'),
  validateUserIdParameter,
  UserController.deleteUser
);

export default router;