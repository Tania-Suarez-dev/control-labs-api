import { ICreateRoomDTO, ROOM_STATUSES, RoomStatus } from '../dtos/room.dtos';
import { DomainError } from '../errors/domain.error';
import { Room, RoomChanges, RoomRepository } from '../repositories/room.repository';

export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  public async createRoom(input: ICreateRoomDTO): Promise<Room> {
    this.validateCapacity(input.capacidadPcs);

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

  public async getRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  public async updateRoom(
    id: string,
    changes: { capacidadPcs?: number; estado?: string }
  ): Promise<Room> {
    const roomId = this.normalizeId(id);

    if (changes.capacidadPcs === undefined && changes.estado === undefined) {
      throw new DomainError('VALIDATION_ERROR', 'Debe enviar capacidadPcs o estado.');
    }

    const validChanges: RoomChanges = {};
    if (changes.capacidadPcs !== undefined) {
      this.validateCapacity(changes.capacidadPcs);
      validChanges.capacidadPcs = changes.capacidadPcs;
    }
    if (changes.estado !== undefined) {
      validChanges.estado = this.validateStatus(changes.estado);
    }

    const updatedRoom = await this.roomRepository.update(roomId, validChanges);
    if (!updatedRoom) {
      throw new DomainError('NOT_FOUND', `No existe una sala con identificador ${id}.`);
    }
    return updatedRoom;
  }

  private validateCapacity(capacidadPcs: number): void {
    if (!Number.isInteger(capacidadPcs) || capacidadPcs < 0) {
      throw new DomainError('VALIDATION_ERROR', 'La capacidad de PCs debe ser un entero mayor o igual a 0.');
    }
  }

  private validateStatus(estado: string): RoomStatus {
    if (!(ROOM_STATUSES as readonly string[]).includes(estado)) {
      throw new DomainError('VALIDATION_ERROR', 'El estado debe ser OPERATIVO, MANTENIMIENTO o INACTIVO.');
    }
    return estado as RoomStatus;
  }

  private normalizeId(id: string): string {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new DomainError('VALIDATION_ERROR', 'El identificador de la sala debe ser un UUID válido.');
    }
    return id.toLowerCase();
  }
}