import { Request, Response, NextFunction } from 'express';
import {
  ICreateIncidentDTO,
  IUpdateIncidentDTO,
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  IncidentStatus
} from '../dtos/incident.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isStatus = (value: unknown): value is IncidentStatus =>
  typeof value === 'string' && (INCIDENT_STATUSES as readonly string[]).includes(value);

const isCreateIncidentDTO = (value: unknown): value is ICreateIncidentDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const incident = value as Record<string, unknown>;
  const allowedFields = new Set(['equipmentId', 'reportedBy', 'descripcion', 'prioridad']);
  return (
    Object.keys(incident).every((key) => allowedFields.has(key)) &&
    isUuid(incident.equipmentId) &&
    isUuid(incident.reportedBy) &&
    typeof incident.descripcion === 'string' &&
    incident.descripcion.trim() !== '' &&
    typeof incident.prioridad === 'string' &&
    (INCIDENT_PRIORITIES as readonly string[]).includes(incident.prioridad)
  );
};

const isUpdateIncidentDTO = (value: unknown): value is IUpdateIncidentDTO => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return Object.keys(body).length === 1 && isStatus(body.estado);
};

export const validateCreateIncidentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isCreateIncidentDTO(body)) {
    res.status(400).json({
      success: false,
      error: 'Datos de la novedad inválidos.'
    });
    return;
  }
  next();
};

export const validateIncidentIdParameter = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  const isPositiveBigInt =
    /^[1-9]\d*$/.test(id) &&
    id.length <= 19 &&
    BigInt(id) <= 9223372036854775807n;

  if (!isPositiveBigInt) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El identificador de la novedad debe ser un entero positivo.'
    });
    return;
  }
  next();
};

export const validateUpdateIncidentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body: unknown = req.body;
  if (!isUpdateIncidentDTO(body)) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'El estado debe ser PENDIENTE, EN_PROCESO o RESUELTA.'
    });
    return;
  }
  next();
};