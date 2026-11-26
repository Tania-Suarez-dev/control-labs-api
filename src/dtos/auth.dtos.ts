import { UserRole } from './user.dtos';

export interface AuthUser {
  id: string;
  rol: UserRole;
  rooms: string[];
}