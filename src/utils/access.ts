import { AuthenticatedUser } from '../auth/authenticated-user';
import { UserRepository } from '../repositories/user.repository';

export const getAllowedRoomIds = async (
  user: AuthenticatedUser,
  userRepository: UserRepository
): Promise<string[] | undefined> => {
  if (user.rol === 'ADMIN') {
    return undefined;
  }

  return userRepository.findRoomIdsByUserId(user.id);
};
