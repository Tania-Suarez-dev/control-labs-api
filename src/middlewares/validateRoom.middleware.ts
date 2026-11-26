import { Request, Response, NextFunction } from 'express';
import {
  ICreateRoomDTO,
  IUpdateRoomDTO,
  ROOM_STATUSES,
  RoomStatus
} from '../dtos/room.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isStatus = (value: unknown): value is RoomStatus =>
  typeof value === 'string' && (ROOM_STATUSES as readonly string[]).includes(value);

const isCreateRoomDTO = (value: unknown): value is ICreateRoomDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const room = value as Record<string, unknown>;
  const allowedFields = new Set(['nombre', 'bloque', 'capacidadPcs']);
  return (
    Object.keys(room).every((key) => allowedFields.has(key)) &&
    typeof room.nombre === 'string' &&
    room.nombre.trim() !== '' &&
    typeof room.bloque === 'string' &&
    room.bloque.trim() !== '' &&
    typeof room.capacidadPcs === 'number' &&
    Number.isInteger(room.capacidadPcs)
  );
};

const isUpdateRoomDTO = (value: unknown): value is IUpdateRoomDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const room = value as Record<string, unknown>;
  const keys = Object.keys(room);
  if (
    keys.length === 0 ||
    !keys.every((key) => key === 'capacidadPcs' || key === 'estado')
  ) {
    return false;
  }

  if (
    room.capacidadPcs !== undefined &&
    (typeof room.capacidadPcs !== 'number' || !Number.isInteger(room.capacidadPcs))
  ) {
    return false;
  }

  if (room.estado !== undefined && !isStatus(room.estado)) {
    return false;
  }

  return true;
};

export const validateCreateRoomPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isCreateRoomDTO(body)) {
    res.status(400).json({
      success: false,
      error: 'Datos de la sala inválidos.'
    });
    return;
  }
  next();
};

export const validateRoomIdParameter = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void => {
  if (!isUuid(req.params.id)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El identificador de la sala debe ser un UUID válido.'
    });
    return;
  }
  next();
};

export const validateUpdateRoomPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isUpdateRoomDTO(body)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Debe enviar capacidadPcs o estado con valores válidos.'
    });
    return;
  }
  next();
};