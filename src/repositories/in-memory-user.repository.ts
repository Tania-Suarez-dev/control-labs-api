import { randomUUID } from 'crypto';
import { ICreateUserDTO, UserRole } from '../dtos/user.dtos';
import { User, UserFilters, UserRepository } from './user.repository';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  public async create(input: ICreateUserDTO): Promise<User> {
    const user: User = {
      ...input,
      id: randomUUID(),
      activo: true,
      createdAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    return { ...user };
  }

  public async findAll(filters: UserFilters = {}): Promise<User[]> {
    return [...this.users.values()]
      .filter((user) => filters.rol === undefined || user.rol === filters.rol)
      .filter((user) => filters.activo === undefined || user.activo === filters.activo)
      .map((user) => ({ ...user }));
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = [...this.users.values()].find((item) => item.email === email);
    return user ? { ...user } : null;
  }

  public async updateRole(id: string, rol: UserRole): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    user.rol = rol;
    return { ...user };
  }

  public async setActive(
    id: string,
    activo: boolean,
    expectedActive: boolean
  ): Promise<User | null> {
    const user = this.users.get(id);
    if (!user || user.activo !== expectedActive) {
      return null;
    }
    user.activo = activo;
    return { ...user };
  }
}