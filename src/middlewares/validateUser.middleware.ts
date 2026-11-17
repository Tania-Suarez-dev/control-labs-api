import { Request, Response, NextFunction } from 'express';
import { ICreateUserDTO, USER_ROLES } from '../dtos/user.dtos';

const isCreateUserDTO = (value: unknown): value is ICreateUserDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const user = value as Record<string, unknown>;
  const allowedFields = new Set(['nombre', 'email', 'rol']);
  return (
    Object.keys(user).every((key) => allowedFields.has(key)) &&
    typeof user.nombre === 'string' &&
    user.nombre.trim() !== '' &&
    typeof user.email === 'string' &&
    user.email.includes('@') &&
    typeof user.rol === 'string' &&
    (USER_ROLES as readonly string[]).includes(user.rol)
  );
};

export const validateCreateUserPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;

  if (!isCreateUserDTO(body)) {
    res.status(400).json({
      success: false,
      error: 'Datos del usuario inválidos.'
    });
    return;
  }

  next();
};