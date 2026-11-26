import { AuthUser } from '../dtos/auth.dtos';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};