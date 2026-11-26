import { ICreateUserDTO, UserRole } from '../dtos/user.dtos';
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

  public getUsers(filters: UserFilters = {}): Promise<User[]> {
    return this.userRepository.findAll(filters);
  }

  public async getUserDetail(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainError('NOT_FOUND', `No existe un usuario con identificador ${id}.`);
    }
    return user;
  }

  public async updateUserRole(id: string, rol: UserRole): Promise<User> {
    const updated = await this.userRepository.updateRole(id, rol);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe un usuario con identificador ${id}.`);
    }
    return updated;
  }

  public async deleteUser(id: string): Promise<User> {
    const updated = await this.userRepository.setActive(id, false, true);
    if (updated) {
      return updated;
    }

    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', 'No existe el usuario.');
    }
    throw new DomainError('CONFLICT', 'El usuario ya está inactivo.');
  }
}