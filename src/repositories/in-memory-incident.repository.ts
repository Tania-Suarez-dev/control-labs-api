import { ICreateIncidentDTO, IncidentStatus } from '../dtos/incident.dtos';
import { Incident, IncidentRepository } from './incident.repository';

export class InMemoryIncidentRepository implements IncidentRepository {
  private readonly incidents = new Map<number, Incident>();
  private nextId = 1;

  public async create(input: ICreateIncidentDTO): Promise<Incident> {
    const incident: Incident = {
      ...input,
      id: this.nextId++,
      estado: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };
    this.incidents.set(incident.id, incident);
    return { ...incident };
  }

  public async findAll(): Promise<Incident[]> {
    return [...this.incidents.values()].map((incident) => ({ ...incident }));
  }

  public async updateStatus(id: number, status: IncidentStatus): Promise<Incident | null> {
    const incident = this.incidents.get(id);
    if (!incident) {
      return null;
    }
    incident.estado = status;
    return { ...incident };
  }
}