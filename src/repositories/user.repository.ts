import { ICreateUserDTO, UserRole } from '../dtos/user.dtos';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  passwordHash: string | null;
}

export interface User extends ICreateUserDTO {
  id: string;
  activo: boolean;
  createdAt: string;
}

export interface UserFilters {
  rol?: UserRole;
  activo?: boolean;
}

export interface UserRepository {
  create(input: ICreateUserDTO): Promise<User>;
  findAll(filters?: UserFilters): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findRoomIdsByUserId(userId: string): Promise<string[]>;
  updateRole(id: string, rol: UserRole): Promise<User | null>;
  setActive(id: string, activo: boolean, expectedActive: boolean): Promise<User | null>;
}
