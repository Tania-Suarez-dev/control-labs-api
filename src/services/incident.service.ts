import { ICreateIncidentDTO, INCIDENT_STATUSES, IncidentStatus } from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import { Incident, IncidentRepository } from '../repositories/incident.repository';

export class IncidentService {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  public async createIncident(input: ICreateIncidentDTO): Promise<Incident> {
    return this.incidentRepository.create({
      equipmentId: input.equipmentId.toLowerCase(),
      reportedBy: input.reportedBy.toLowerCase(),
      descripcion: input.descripcion.trim(),
      prioridad: input.prioridad
    });
  }

  public async getIncidents(): Promise<Incident[]> {
    return this.incidentRepository.findAll();
  }

  public async updateIncidentStatus(id: number, estado: string): Promise<Incident> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError('VALIDATION_ERROR', 'El identificador de la novedad debe ser un entero positivo.');
    }

    const validStatus = this.validateStatus(estado);

    const updatedIncident = await this.incidentRepository.updateStatus(id, validStatus);
    if (!updatedIncident) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    return updatedIncident;
  }

  private validateStatus(estado: string): IncidentStatus {
    if (!(INCIDENT_STATUSES as readonly string[]).includes(estado)) {
      throw new DomainError('VALIDATION_ERROR', 'El estado debe ser PENDIENTE, EN_PROCESO o RESUELTA.');
    }
    return estado as IncidentStatus;
  }
}