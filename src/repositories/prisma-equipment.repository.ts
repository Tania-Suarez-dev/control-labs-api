import { PrismaClient, Equipment as PrismaEquipment } from '@prisma/client';
import { EquipmentStatus, ICreateEquipmentDTO } from '../dtos/equipment.dtos';
import { DomainError } from '../errors/domain.error';
import {
  Equipment,
  EquipmentChanges,
  EquipmentFilters,
  EquipmentRepository
} from './equipment.repository';

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
    throw new DomainError('VALIDATION_ERROR', 'La sala indicada no existe.');
  }

  if (code === 'P2002' || code === '23505') {
    throw new DomainError(
      'CONFLICT',
      'Ya existe un equipo con esa placa SENA o ese código de activo.'
    );
  }

  if (code === 'P2004' || code === '23514') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'Los datos del equipo incumplen una restricción de la base de datos.'
    );
  }
};

export class PrismaEquipmentRepository implements EquipmentRepository {
  constructor(private readonly database: PrismaClient) {}

  public async create(input: ICreateEquipmentDTO): Promise<Equipment> {
    try {
      const equipment = await this.database.equipment.create({
        data: {
          placaSena: input.placaSena,
          codigoActivo: input.codigoActivo,
          tipo: input.tipo,
          roomId: input.roomId
        }
      });
      return this.toDomain(equipment);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(
    filters: EquipmentFilters = {},
    allowedRoomIds?: string[]
  ): Promise<Equipment[]> {
    const roomIdFilter = filters.roomId
      ? filters.roomId
      : allowedRoomIds === undefined
        ? undefined
        : { in: allowedRoomIds };

    const equipment = await this.database.equipment.findMany({
      where: { roomId: roomIdFilter },
      orderBy: { placaSena: 'asc' }
    });
    return equipment.map((item) => this.toDomain(item));
  }

  public async findById(id: string): Promise<Equipment | null> {
    const equipment = await this.database.equipment.findUnique({ where: { id } });
    return equipment ? this.toDomain(equipment) : null;
  }

  public async findByPlacaSena(placaSena: string): Promise<Equipment | null> {
    const equipment = await this.database.equipment.findUnique({
      where: { placaSena }
    });
    return equipment ? this.toDomain(equipment) : null;
  }

  public async findByCodigoActivo(codigoActivo: string): Promise<Equipment | null> {
    const equipment = await this.database.equipment.findUnique({
      where: { codigoActivo }
    });
    return equipment ? this.toDomain(equipment) : null;
  }

  public async update(id: string, changes: EquipmentChanges): Promise<Equipment | null> {
    try {
      const result = await this.database.equipment.updateMany({
        where: { id },
        data: changes
      });
      if (result.count === 0) {
        return null;
      }
      const equipment = await this.database.equipment.findUnique({ where: { id } });
      return equipment ? this.toDomain(equipment) : null;
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async move(
    id: string,
    toRoomId: string,
    movedBy: string
  ): Promise<Equipment | null> {
    try {
      return await this.database.$transaction(async (tx) => {
        const current = await tx.equipment.findUnique({ where: { id } });
        if (!current) {
          return null;
        }

        if (current.roomId === toRoomId) {
          throw new DomainError('CONFLICT', 'El equipo ya está en esa sala.');
        }

        const updated = await tx.equipment.update({
          where: { id },
          data: { roomId: toRoomId }
        });

        await tx.equipmentMovement.create({
          data: {
            equipmentId: id,
            fromRoomId: current.roomId,
            toRoomId,
            movedBy
          }
        });

        return this.toDomain(updated);
      });
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(equipment: PrismaEquipment): Equipment {
    return {
      id: equipment.id,
      placaSena: equipment.placaSena,
      codigoActivo: equipment.codigoActivo,
      tipo: equipment.tipo as Equipment['tipo'],
      roomId: equipment.roomId,
      estado: equipment.estado as EquipmentStatus
    };
  }
}
