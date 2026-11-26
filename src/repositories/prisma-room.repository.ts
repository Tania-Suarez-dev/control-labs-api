import { PrismaClient, Room as PrismaRoom } from '@prisma/client';
import { ICreateRoomDTO, RoomStatus } from '../dtos/room.dtos';
import { DomainError } from '../errors/domain.error';
import { Room, RoomChanges, RoomRepository } from './room.repository';

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

  if (code === 'P2002' || code === '23505') {
    throw new DomainError('CONFLICT', 'Ya existe una sala con ese nombre.');
  }

  if (code === 'P2004' || code === '23514') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'Los datos de la sala incumplen una restricción de la base de datos.'
    );
  }
};

export class PrismaRoomRepository implements RoomRepository {
  constructor(private readonly database: PrismaClient) {}

  public async create(input: ICreateRoomDTO): Promise<Room> {
    try {
      const room = await this.database.room.create({
        data: {
          nombre: input.nombre,
          bloque: input.bloque,
          capacidadPcs: input.capacidadPcs
        }
      });
      return this.toDomain(room);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(): Promise<Room[]> {
    const rooms = await this.database.room.findMany({
      orderBy: { nombre: 'asc' }
    });
    return rooms.map((room) => this.toDomain(room));
  }

  public async findByNombre(nombre: string): Promise<Room | null> {
    const room = await this.database.room.findUnique({ where: { nombre } });
    return room ? this.toDomain(room) : null;
  }

  public async update(id: string, changes: RoomChanges): Promise<Room | null> {
    try {
      const result = await this.database.room.updateMany({
        where: { id },
        data: changes
      });
      if (result.count === 0) {
        return null;
      }
      const room = await this.database.room.findUnique({ where: { id } });
      return room ? this.toDomain(room) : null;
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(room: PrismaRoom): Room {
    return {
      id: room.id,
      nombre: room.nombre,
      bloque: room.bloque,
      capacidadPcs: room.capacidadPcs,
      estado: room.estado as RoomStatus
    };
  }
}