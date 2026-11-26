import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router = Router();

router.get('/me', authenticate, AuthController.me);

export default router;