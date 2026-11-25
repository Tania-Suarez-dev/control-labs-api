export const INCIDENT_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA'] as const;
export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

export interface ICreateIncidentDTO {
  equipmentId: string;
  reportedBy: string;
  descripcion: string;
  prioridad: IncidentPriority;
}