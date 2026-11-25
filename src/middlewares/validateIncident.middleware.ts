import { Request, Response, NextFunction } from 'express';
import { ICreateIncidentDTO, INCIDENT_PRIORITIES } from '../dtos/incident.dtos';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

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

export const validateCreateIncidentPayload = (req: Request, res: Response, next: NextFunction): void => {
  const body: unknown = req.body;

  if (!isCreateIncidentDTO(body)) {
    res.status(400).json({ success: false, error: 'Datos de la novedad inválidos.' });
    return;
  }

  next();
};