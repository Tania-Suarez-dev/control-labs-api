import { ICreateUserDTO, UserRole } from '../dtos/user.dtos';

export interface User extends ICreateUserDTO {
  id: string;
  activo: boolean;
  createdAt: string;
  passwordHash?: string | null;
}

export interface UserFilters {
  rol?: UserRole;
  activo?: boolean;
}

export interface UserRepository {
  create(input: ICreateUserDTO): Promise<User>;
  findAll(filters?: UserFilters): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findRoomIdsByUserId(id: string): Promise<string[]>;
  updateRole(id: string, rol: UserRole): Promise<User | null>;
  setActive(id: string, activo: boolean, expectedActive: boolean): Promise<User | null>;
}