import { PrismaClient, Incident as PrismaIncident } from '@prisma/client';
import {
  ICreateIncidentDTO,
  IncidentPriority,
  IncidentStatus
} from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import { Incident, IncidentRepository } from './incident.repository';

const getDatabaseCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string') {
    return code;
  }

  const message = error instanceof Error ? error.message : String(error);
  const sqlState = /code:\s*["']?(\d{5})["']?/.exec(message);
  return sqlState?.[1];
};

const translatePersistenceError = (error: unknown): void => {
  const code = getDatabaseCode(error);

  if (code === 'P2003' || code === '23503') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'El equipo o el reportante indicados no existen.'
    );
  }

  if (code === 'P2004' || code === '23514') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'Los datos de la novedad incumplen una restricción de la base de datos.'
    );
  }
};

export class PrismaIncidentRepository implements IncidentRepository {
  constructor(private readonly database: PrismaClient) {}

  public async create(input: ICreateIncidentDTO): Promise<Incident> {
    try {
      const incident = await this.database.incident.create({
        data: {
          equipmentId: input.equipmentId,
          reportedBy: input.reportedBy,
          descripcion: input.descripcion,
          prioridad: input.prioridad
        }
      });
      return this.toDomain(incident);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(): Promise<Incident[]> {
    const incidents = await this.database.incident.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return incidents.map((incident) => this.toDomain(incident));
  }

  public async updateStatus(id: string, status: IncidentStatus): Promise<Incident | null> {
    try {
      const result = await this.database.incident.updateMany({
        where: { id: BigInt(id) },
        data: { estado: status }
      });
      if (result.count === 0) {
        return null;
      }
      const incident = await this.database.incident.findUnique({
        where: { id: BigInt(id) }
      });
      return incident ? this.toDomain(incident) : null;
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(incident: PrismaIncident): Incident {
    return {
      id: incident.id.toString(),
      equipmentId: incident.equipmentId,
      reportedBy: incident.reportedBy,
      descripcion: incident.descripcion,
      prioridad: incident.prioridad as IncidentPriority,
      estado: incident.estado as IncidentStatus,
      createdAt: incident.createdAt.toISOString()
    };
  }
}