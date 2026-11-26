import {
  Incident as PrismaIncident,
  IncidentComment as PrismaIncidentComment,
  Prisma,
  PrismaClient
} from '@prisma/client';
import {
  ICreateIncidentDTO,
  IncidentPriority,
  IncidentStatus
} from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import {
  Incident,
  IncidentComment,
  IncidentFilters,
  IncidentRepository
} from './incident.repository';

type IncidentWithComments = PrismaIncident & {
  comments: PrismaIncidentComment[];
  equipment: { roomId: string };
};

const toCommentType = (value: string): IncidentComment['tipo'] => {
  if (value === 'COMENTARIO' || value === 'RESOLUCION') {
    return value;
  }
  throw new Error(`Tipo de comentario no reconocido en la base de datos: ${value}`);
};

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
      'El equipo, el reportante o el autor indicados no existen.'
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

  public async create(input: ICreateIncidentDTO, reportedBy: string): Promise<Incident> {
    try {
      const incident = await this.database.incident.create({
        data: {
          equipmentId: input.equipmentId,
          reportedBy,
          descripcion: input.descripcion,
          prioridad: input.prioridad
        },
        include: {
          comments: { orderBy: { createdAt: 'asc' } },
          equipment: { select: { roomId: true } }
        }
      });
      return this.toDomain(incident as IncidentWithComments);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(filters: IncidentFilters = {}): Promise<Incident[]> {
    const where: Prisma.IncidentWhereInput = {};

    if (filters.roomIds) {
      where.equipment = { roomId: { in: filters.roomIds } };
    } else if (filters.roomId) {
      where.equipment = { roomId: filters.roomId };
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }

    const incidents = await this.database.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        equipment: { select: { roomId: true } }
      }
    });
    return incidents.map((incident) => this.toDomain(incident as IncidentWithComments));
  }

  public async findById(id: string): Promise<Incident | null> {
    const incident = await this.database.incident.findUnique({
      where: { id: BigInt(id) },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        equipment: { select: { roomId: true } }
      }
    });
    return incident ? this.toDomain(incident as IncidentWithComments) : null;
  }

  public async updateStatus(
    id: string,
    status: IncidentStatus
  ): Promise<Incident | null> {
    try {
      const result = await this.database.incident.updateMany({
        where: { id: BigInt(id) },
        data: { estado: status }
      });
      return result.count === 0 ? null : this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async addComment(
    id: string,
    authorId: string,
    contenido: string,
    tipo: IncidentComment['tipo']
  ): Promise<Incident | null> {
    try {
      const incident = await this.findById(id);
      if (!incident) {
        return null;
      }

      await this.database.incidentComment.create({
        data: {
          incidentId: BigInt(id),
          authorId,
          tipo,
          contenido
        }
      });

      return this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async resolve(
    id: string,
    authorId: string,
    contenido: string
  ): Promise<Incident | null> {
    try {
      return await this.database.$transaction(async (tx) => {
        const incident = await tx.incident.findUnique({
          where: { id: BigInt(id) }
        });
        if (!incident) {
          return null;
        }
        if (incident.estado === 'RESUELTA') {
          throw new DomainError('CONFLICT', 'La novedad ya está resuelta.');
        }

        await tx.incident.update({
          where: { id: BigInt(id) },
          data: { estado: 'RESUELTA' }
        });

        await tx.incidentComment.create({
          data: {
            incidentId: BigInt(id),
            authorId,
            tipo: 'RESOLUCION',
            contenido
          }
        });

        const updated = await tx.incident.findUniqueOrThrow({
          where: { id: BigInt(id) },
          include: {
            comments: { orderBy: { createdAt: 'asc' } },
            equipment: { select: { roomId: true } }
          }
        });
        return this.toDomain(updated as IncidentWithComments);
      });
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(incident: IncidentWithComments): Incident {
    const comments: IncidentComment[] = incident.comments
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((comment) => ({
        id: comment.id.toString(),
        incidentId: comment.incidentId.toString(),
        authorId: comment.authorId,
        tipo: toCommentType(comment.tipo),
        contenido: comment.contenido,
        createdAt: comment.createdAt.toISOString()
      }));

    const resolution =
      [...comments].reverse().find((comment) => comment.tipo === 'RESOLUCION') ?? null;

    return {
      id: incident.id.toString(),
      roomId: incident.equipment.roomId,
      equipmentId: incident.equipmentId,
      reportedBy: incident.reportedBy,
      descripcion: incident.descripcion,
      prioridad: incident.prioridad as IncidentPriority,
      estado: incident.estado as IncidentStatus,
      createdAt: incident.createdAt.toISOString(),
      comments,
      resolvedAt: resolution?.createdAt ?? null,
      resolvedBy: resolution?.authorId ?? null,
      solucion: resolution?.contenido ?? null
    };
  }
}
