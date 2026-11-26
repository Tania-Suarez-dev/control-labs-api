import { ICreateIncidentDTO, IncidentStatus } from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import {
  Incident,
  IncidentFilters,
  IncidentRepository
} from '../repositories/incident.repository';

export class IncidentService {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  public createIncident(input: ICreateIncidentDTO, reportedBy: string): Promise<Incident> {
    return this.incidentRepository.create(
      {
        equipmentId: input.equipmentId,
        descripcion: input.descripcion.trim(),
        prioridad: input.prioridad
      },
      reportedBy
    );
  }

  public getIncidents(
    filters: IncidentFilters = {},
    allowedRoomIds?: string[]
  ): Promise<Incident[]> {
    if (!allowedRoomIds) {
      return this.incidentRepository.findAll(filters);
    }

    if (filters.roomId) {
      if (!allowedRoomIds.includes(filters.roomId)) {
        throw new DomainError('FORBIDDEN', 'No tiene permiso sobre esa sala.');
      }
      return this.incidentRepository.findAll({ ...filters, roomId: filters.roomId });
    }

    return this.incidentRepository.findAll({ ...filters, roomIds: allowedRoomIds });
  }

  private assertRoomAccess(incident: Incident, allowedRoomIds?: string[]): void {
    if (allowedRoomIds && !allowedRoomIds.includes(incident.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre esa novedad.');
    }
  }

  public async getIncidentDetail(id: string, allowedRoomIds?: string[]): Promise<Incident> {
    const incident = await this.incidentRepository.findById(id);
    if (!incident) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    this.assertRoomAccess(incident, allowedRoomIds);
    return incident;
  }

  public async updateIncidentStatus(
    id: string,
    estado: IncidentStatus,
    allowedRoomIds?: string[]
  ): Promise<Incident> {
    const current = await this.incidentRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    this.assertRoomAccess(current, allowedRoomIds);

    const updated = await this.incidentRepository.updateStatus(id, estado);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    return updated;
  }

  public async addComment(
    id: string,
    authorId: string,
    contenido: string,
    allowedRoomIds?: string[]
  ): Promise<Incident> {
    const texto = contenido.trim();
    if (!texto) {
      throw new DomainError('VALIDATION_ERROR', 'El comentario no puede estar vacío.');
    }

    const current = await this.incidentRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    this.assertRoomAccess(current, allowedRoomIds);

    const updated = await this.incidentRepository.addComment(
      id,
      authorId,
      texto,
      'COMENTARIO'
    );
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    return updated;
  }

  public async resolveIncident(
    id: string,
    authorId: string,
    contenido: string,
    allowedRoomIds?: string[]
  ): Promise<Incident> {
    const texto = contenido.trim();
    if (!texto) {
      throw new DomainError('VALIDATION_ERROR', 'La solución no puede estar vacía.');
    }

    const current = await this.incidentRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    this.assertRoomAccess(current, allowedRoomIds);

    const resolved = await this.incidentRepository.resolve(id, authorId, texto);
    if (!resolved) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    return resolved;
  }
}
