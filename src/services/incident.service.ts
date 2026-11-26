import { ICreateIncidentDTO, IncidentStatus } from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import { Incident, IncidentRepository } from '../repositories/incident.repository';

export class IncidentService {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  public createIncident(input: ICreateIncidentDTO): Promise<Incident> {
    return this.incidentRepository.create({
      equipmentId: input.equipmentId,
      reportedBy: input.reportedBy,
      descripcion: input.descripcion.trim(),
      prioridad: input.prioridad
    });
  }

  public getIncidents(): Promise<Incident[]> {
    return this.incidentRepository.findAll();
  }

  public async updateIncidentStatus(id: string, estado: IncidentStatus): Promise<Incident> {
    const updated = await this.incidentRepository.updateStatus(id, estado);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe una novedad con identificador ${id}.`);
    }
    return updated;
  }
}