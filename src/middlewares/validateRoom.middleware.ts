import { Request, Response, NextFunction } from 'express';
import { ICreateRoomDTO } from '../dtos/room.dtos';

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