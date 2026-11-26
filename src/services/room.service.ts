import { ICreateRoomDTO } from '../dtos/room.dtos';
import { DomainError } from '../errors/domain.error';
import { Room, RoomChanges, RoomRepository } from '../repositories/room.repository';

export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  public async createRoom(input: ICreateRoomDTO): Promise<Room> {
    const nombre = input.nombre.trim();

    if (await this.roomRepository.findByNombre(nombre)) {
      throw new DomainError('CONFLICT', 'Ya existe una sala con ese nombre.');
    }

    return this.roomRepository.create({
      nombre,
      bloque: input.bloque.trim(),
      capacidadPcs: input.capacidadPcs
    });
  }

  public getRooms(allowedRoomIds?: string[]): Promise<Room[]> {
    return this.roomRepository.findAll(allowedRoomIds);
  }

  public async updateRoom(
    id: string,
    changes: RoomChanges,
    allowedRoomIds?: string[]
  ): Promise<Room> {
    if (allowedRoomIds && !allowedRoomIds.includes(id)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre esa sala.');
    }

    const updated = await this.roomRepository.update(id, changes);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe una sala con identificador ${id}.`);
    }
    return updated;
  }
}
