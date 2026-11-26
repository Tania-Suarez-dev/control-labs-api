import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { ICreateUserDTO, UserRole } from '../dtos/user.dtos';
import { DomainError } from '../errors/domain.error';
import { AuthUser, User, UserFilters, UserRepository } from './user.repository';

const getDatabaseCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string') {
    return code;
  }

  const message = error instanceof Error ? error.message : String(error);
  const sqlState = /code:\s*["']?(\d{5})["']?/.exec(message);
  return sqlState?.[1];
};

const translatePersistenceError = (error: unknown): void => {
  const code = getDatabaseCode(error);

  if (code === 'P2002' || code === '23505') {
    throw new DomainError(
      'CONFLICT',
      'Ya existe un usuario con ese correo electrónico.'
    );
  }

  if (code === 'P2004' || code === '23514') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'Los datos del usuario incumplen una restricción de la base de datos.'
    );
  }
};

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly database: PrismaClient) {}

  public async create(input: ICreateUserDTO): Promise<User> {
    try {
      const user = await this.database.user.create({
        data: {
          nombre: input.nombre,
          email: input.email,
          rol: input.rol
        }
      });
      return this.toDomain(user);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(filters: UserFilters = {}): Promise<User[]> {
    const users = await this.database.user.findMany({
      where: {
        rol: filters.rol,
        activo: filters.activo
      },
      orderBy: { createdAt: 'desc' }
    });
    return users.map((user) => this.toDomain(user));
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.database.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  public async findByEmail(email: string): Promise<AuthUser | null> {
  const user = await this.database.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol as UserRole,
    activo: user.activo,
    passwordHash: user.passwordHash
  };
}

  public async updateRole(id: string, rol: UserRole): Promise<User | null> {
    try {
      const result = await this.database.user.updateMany({
        where: { id },
        data: { rol }
      });
      return result.count === 0 ? null : this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async setActive(
    id: string,
    activo: boolean,
    expectedActive: boolean
  ): Promise<User | null> {
    const result = await this.database.user.updateMany({
      where: { id, activo: expectedActive },
      data: { activo }
    });
    return result.count === 0 ? null : this.findById(id);
  }

  private toDomain(user: PrismaUser): User {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol as UserRole,
      activo: user.activo,
      createdAt: user.createdAt.toISOString()
    };
  }
}