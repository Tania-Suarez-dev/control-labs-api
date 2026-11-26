import { AuthUser } from '../dtos/auth.dtos';

export const getAllowedRoomIds = (user?: AuthUser): string[] | undefined => {
  if (!user) return [];
  return user.rol === 'ADMIN' ? undefined : user.rooms;
};
