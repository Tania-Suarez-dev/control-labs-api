import { Request, Response, NextFunction } from 'express';
import {
  ICreateUserDTO,
  IUpdateUserRoleDTO,
  USER_ROLES,
  UserRole
} from '../dtos/user.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

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
    isRole(user.rol)
  );
};

const isUpdateUserRoleDTO = (value: unknown): value is IUpdateUserRoleDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return Object.keys(body).every((key) => key === 'rol') && isRole(body.rol);
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

export const validateUserIdParameter = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void => {
  if (!isUuid(req.params.id)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El identificador del usuario debe ser un UUID válido.'
    });
    return;
  }
  next();
};

export const validateUserSearchQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { rol, activo } = req.query;
  const rolOk = rol === undefined || isRole(rol);
  const activoOk = activo === undefined || activo === 'true' || activo === 'false';

  if (!rolOk || !activoOk) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Los filtros rol y activo no son válidos.'
    });
    return;
  }
  next();
};

export const validateUpdateUserRolePayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isUpdateUserRoleDTO(body)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El rol debe ser ADMIN, GUARDA o INSTRUCTOR.'
    });
    return;
  }
  next();
};