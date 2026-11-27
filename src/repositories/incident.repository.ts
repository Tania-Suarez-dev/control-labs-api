import {
  ICreateIncidentDTO,
  IncidentCommentType,
  IncidentStatus
} from '../dtos/incident.dtos';

export interface IncidentComment {
  id: string;
  incidentId: string;
  authorId: string;
  tipo: IncidentCommentType;
  contenido: string;
  createdAt: string;
}

export interface Incident extends ICreateIncidentDTO {
  id: string;
  roomId: string;
  reportedBy: string;
  estado: IncidentStatus;
  createdAt: string;
  comments: IncidentComment[];
  resolvedAt: string | null;
  resolvedBy: string | null;
  solucion: string | null;
}

export interface IncidentFilters {
  roomId?: string;
  roomIds?: string[];
  estado?: IncidentStatus;
}

export interface IncidentRepository {
  create(input: ICreateIncidentDTO, reportedBy: string): Promise<Incident>;
  findAll(filters?: IncidentFilters): Promise<Incident[]>;
  findById(id: string): Promise<Incident | null>;
  findEquipmentRoomId(equipmentId: string): Promise<string | null>;
  updateStatus(id: string, status: IncidentStatus): Promise<Incident | null>;
  addComment(
    id: string,
    authorId: string,
    contenido: string,
    tipo: IncidentCommentType
  ): Promise<Incident | null>;
  resolve(id: string, authorId: string, contenido: string): Promise<Incident | null>;
}
