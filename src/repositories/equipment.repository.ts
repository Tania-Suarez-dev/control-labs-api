import { EquipmentStatus, ICreateEquipmentDTO, IMoveEquipmentDTO } from '../dtos/equipment.dtos';

export interface Equipment extends ICreateEquipmentDTO {
  id: string;
  estado: EquipmentStatus;
}

export interface EquipmentFilters {
  roomId?: string;
  roomIds?: string[];
}

export interface EquipmentChanges {
  estado?: EquipmentStatus;
  roomId?: string;
}

export interface EquipmentRepository {
  create(input: ICreateEquipmentDTO): Promise<Equipment>;
  findAll(filters?: EquipmentFilters): Promise<Equipment[]>;
  findById(id: string): Promise<Equipment | null>;
  findByPlacaSena(placaSena: string): Promise<Equipment | null>;
  findByCodigoActivo(codigoActivo: string): Promise<Equipment | null>;
  update(id: string, changes: EquipmentChanges): Promise<Equipment | null>;
  move(id: string, input: IMoveEquipmentDTO, movedBy: string): Promise<Equipment | null>;
}
