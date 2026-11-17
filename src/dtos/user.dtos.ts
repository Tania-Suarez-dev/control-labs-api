export const USER_ROLES = ['ADMIN', 'GUARDA', 'INSTRUCTOR'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface ICreateUserDTO {
  nombre: string;
  email: string;
  rol: UserRole;
}