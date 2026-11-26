import { ICreateIncidentDTO, IncidentStatus } from '../dtos/incident.dtos';

export interface Incident extends ICreateIncidentDTO {
  id: string;
  estado: IncidentStatus;
  createdAt: string;
}

export interface IncidentRepository {
  create(input: ICreateIncidentDTO): Promise<Incident>;
  findAll(): Promise<Incident[]>;
  updateStatus(id: string, status: IncidentStatus): Promise<Incident | null>;
}