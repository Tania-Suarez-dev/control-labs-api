export const INCIDENT_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA'] as const;
export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

export const INCIDENT_STATUSES = ['PENDIENTE', 'EN_PROCESO', 'RESUELTA'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface ICreateIncidentDTO {
  equipmentId: string;
  reportedBy: string;
  descripcion: string;
  prioridad: IncidentPriority;
}

export interface IUpdateIncidentDTO {
  estado: IncidentStatus;
}