import { randomUUID } from 'crypto';
import { ICreateRoomDTO } from '../dtos/room.dtos';
import { Room, RoomChanges, RoomRepository } from './room.repository';

export class InMemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, Room>();

  public async create(input: ICreateRoomDTO): Promise<Room> {
    const room: Room = {
      ...input,
      id: randomUUID(),
      estado: 'OPERATIVO'
    };
    this.rooms.set(room.id, room);
    return { ...room };
  }

  public async findAll(): Promise<Room[]> {
    return [...this.rooms.values()].map((room) => ({ ...room }));
  }

  public async findByNombre(nombre: string): Promise<Room | null> {
    const room = [...this.rooms.values()].find((item) => item.nombre === nombre);
    return room ? { ...room } : null;
  }

  public async update(id: string, changes: RoomChanges): Promise<Room | null> {
    const room = this.rooms.get(id);
    if (!room) {
      return null;
    }
    if (changes.capacidadPcs !== undefined) {
      room.capacidadPcs = changes.capacidadPcs;
    }
    if (changes.estado !== undefined) {
      room.estado = changes.estado;
    }
    return { ...room };
  }
}