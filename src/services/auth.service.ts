import bcrypt from 'bcryptjs';
import { AuthUser } from '../dtos/auth.dtos';
import { DomainError } from '../errors/domain.error';
import { UserRepository } from '../repositories/user.repository';

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  public async verify(email: string, password: string): Promise<AuthUser> {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findByEmail(normalized);

    if (!user?.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new DomainError('UNAUTHORIZED', 'Credenciales invalidas.');
    }

    const rooms = await this.users.findRoomIdsByUserId(user.id);

    return {
      id: user.id,
      rol: user.rol,
      rooms
    };
  }
}