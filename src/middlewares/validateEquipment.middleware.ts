import { Request, Response, NextFunction } from 'express';
import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPES,
  EquipmentStatus,
  ICreateEquipmentDTO,
  IMoveEquipmentDTO,
  IUpdateEquipmentDTO
} from '../dtos/equipment.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isStatus = (value: unknown): value is EquipmentStatus =>
  typeof value === 'string' && (EQUIPMENT_STATUSES as readonly string[]).includes(value);

const isCreateEquipmentDTO = (value: unknown): value is ICreateEquipmentDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const equipment = value as Record<string, unknown>;
  const allowedFields = new Set(['placaSena', 'codigoActivo', 'tipo', 'roomId']);
  return (
    Object.keys(equipment).every((key) => allowedFields.has(key)) &&
    typeof equipment.placaSena === 'string' &&
    equipment.placaSena.trim() !== '' &&
    typeof equipment.codigoActivo === 'string' &&
    equipment.codigoActivo.trim() !== '' &&
    typeof equipment.tipo === 'string' &&
    (EQUIPMENT_TYPES as readonly string[]).includes(equipment.tipo) &&
    isUuid(equipment.roomId)
  );
};

const isUpdateEquipmentDTO = (value: unknown): value is IUpdateEquipmentDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const equipment = value as Record<string, unknown>;
  const keys = Object.keys(equipment);
  if (
    keys.length === 0 ||
    !keys.every((key) => key === 'estado' || key === 'roomId')
  ) {
    return false;
  }

  if (equipment.estado !== undefined && !isStatus(equipment.estado)) {
    return false;
  }

  if (equipment.roomId !== undefined && !isUuid(equipment.roomId)) {
    return false;
  }

  return true;
};

const isMoveEquipmentDTO = (value: unknown): value is IMoveEquipmentDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return Object.keys(body).every((key) => key === 'roomId') && isUuid(body.roomId);
};

export const validateCreateEquipmentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isCreateEquipmentDTO(body)) {
    res.status(400).json({
      success: false,
      error: 'Datos del equipo inválidos.'
    });
    return;
  }
  next();
};

export const validateEquipmentIdParameter = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void => {
  if (!isUuid(req.params.id)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El identificador del equipo debe ser un UUID válido.'
    });
    return;
  }
  next();
};

export const validateEquipmentSearchQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { roomId } = req.query;
  if (roomId !== undefined && !isUuid(roomId)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El filtro roomId debe ser un UUID válido.'
    });
    return;
  }
  next();
};

export const validateUpdateEquipmentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isUpdateEquipmentDTO(body)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Debe enviar estado o roomId con valores válidos.'
    });
    return;
  }
  next();
};

export const validateMoveEquipmentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isMoveEquipmentDTO(body)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El cuerpo debe contener únicamente "roomId" con un UUID válido.'
    });
    return;
  }
  next();
};
