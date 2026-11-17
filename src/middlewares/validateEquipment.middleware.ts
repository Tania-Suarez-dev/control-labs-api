import { Request, Response, NextFunction } from 'express';
import { EQUIPMENT_TYPES, ICreateEquipmentDTO } from '../dtos/equipment.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

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

export const validateCreateEquipmentPayload = (req: Request, res: Response, next: NextFunction): void => {
  const body: unknown = req.body;

  if (!isCreateEquipmentDTO(body)) {
    res.status(400).json({ success: false, error: 'Datos del equipo inválidos.' });
    return;
  }

  next();
};