import { ICreateRoomDTO, RoomStatus } from '../dtos/room.dtos';

export interface Room extends ICreateRoomDTO {
  id: string;
  estado: RoomStatus;
}

export interface RoomChanges {
  capacidadPcs?: number;
  estado?: RoomStatus;
}

export interface RoomRepository {
  create(input: ICreateRoomDTO): Promise<Room>;
  findAll(allowedRoomIds?: string[]): Promise<Room[]>;
  findById(id: string): Promise<Room | null>;
  findByNombre(nombre: string): Promise<Room | null>;
  update(id: string, changes: RoomChanges): Promise<Room | null>;
}
