import { Request, Response, NextFunction } from 'express';
import { ICreateRoomDTO } from '../dtos/room.dtos';

const isCreateRoomDTO = (value: unknown): value is ICreateRoomDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const room = value as Record<string, unknown>;
  return (
    typeof room.nombre === 'string' &&
    room.nombre.trim() !== '' &&
    typeof room.capacidad === 'number' &&
    Number.isInteger(room.capacidad) &&
    room.capacidad > 0 &&
    typeof room.ubicacion === 'string' &&
    room.ubicacion.trim() !== ''
  );
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
      error: 'Datos del ambiente inválidos.'
    });
    return;
  }

  next();
};