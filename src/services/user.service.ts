import { ICreateUserDTO, USER_ROLES, UserRole } from '../dtos/user.dtos';
import { DomainError } from '../errors/domain.error';
import { User, UserFilters, UserRepository } from '../repositories/user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(input: ICreateUserDTO): Promise<User> {
    const email = input.email.trim().toLowerCase();

    if (await this.userRepository.findByEmail(email)) {
      throw new DomainError('CONFLICT', 'Ya existe un usuario con ese correo electrónico.');
    }

    return this.userRepository.create({
      nombre: input.nombre.trim(),
      email,
      rol: input.rol
    });
  }

  public async getUsers(filters: { rol?: string; activo?: boolean } = {}): Promise<User[]> {
    const repositoryFilters: UserFilters = { activo: filters.activo };

    if (filters.rol !== undefined) {
      repositoryFilters.rol = this.validateRole(filters.rol);
    }

    return this.userRepository.findAll(repositoryFilters);
  }

  public async getUserDetail(id: string): Promise<User> {
    const userId = this.normalizeId(id);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainError('NOT_FOUND', `No existe un usuario con identificador ${id}.`);
    }
    return user;
  }

  public async updateUserRole(id: string, rol: string): Promise<User> {
    const userId = this.normalizeId(id);
    const validRole = this.validateRole(rol);

    const updatedUser = await this.userRepository.updateRole(userId, validRole);
    if (!updatedUser) {
      throw new DomainError('NOT_FOUND', `No existe un usuario con identificador ${id}.`);
    }
    return updatedUser;
  }

  public async deleteUser(id: string): Promise<User> {
    const userId = this.normalizeId(id);

    const updatedUser = await this.userRepository.setActive(userId, false, true);
    if (updatedUser) {
      return updatedUser;
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new DomainError('NOT_FOUND', `No existe un usuario con identificador ${id}.`);
    }
    throw new DomainError('CONFLICT', 'El usuario ya está inactivo.');
  }

  private validateRole(rol: string): UserRole {
    if (!(USER_ROLES as readonly string[]).includes(rol)) {
      throw new DomainError('VALIDATION_ERROR', 'El rol debe ser ADMIN, GUARDA o INSTRUCTOR.');
    }
    return rol as UserRole;
  }

  private normalizeId(id: string): string {
    this.validateId(id);
    return id.toLowerCase();
  }

  private validateId(id: string): void {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new DomainError('VALIDATION_ERROR', 'El identificador del usuario debe ser un UUID válido.');
    }
  }
}