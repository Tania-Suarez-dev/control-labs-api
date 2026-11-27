import { EquipmentStatus, ICreateEquipmentDTO } from '../dtos/equipment.dtos';

export interface Equipment extends ICreateEquipmentDTO {
  id: string;
  estado: EquipmentStatus;
}

export interface EquipmentFilters {
  roomId?: string;
}

export interface EquipmentChanges {
  estado?: EquipmentStatus;
  roomId?: string;
}

export interface EquipmentRepository {
  create(input: ICreateEquipmentDTO): Promise<Equipment>;
  findAll(filters?: EquipmentFilters, allowedRoomIds?: string[]): Promise<Equipment[]>;
  findById(id: string): Promise<Equipment | null>;
  findByPlacaSena(placaSena: string): Promise<Equipment | null>;
  findByCodigoActivo(codigoActivo: string): Promise<Equipment | null>;
  update(id: string, changes: EquipmentChanges): Promise<Equipment | null>;
  move(id: string, toRoomId: string, movedBy: string): Promise<Equipment | null>;
}
