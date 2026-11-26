import { ICreateEquipmentDTO, IMoveEquipmentDTO } from '../dtos/equipment.dtos';
import { DomainError } from '../errors/domain.error';
import {
  Equipment,
  EquipmentChanges,
  EquipmentFilters,
  EquipmentRepository
} from '../repositories/equipment.repository';

export class EquipmentService {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  public async createEquipment(input: ICreateEquipmentDTO): Promise<Equipment> {
    const placaSena = input.placaSena.trim();
    const codigoActivo = input.codigoActivo.trim();

    if (await this.equipmentRepository.findByPlacaSena(placaSena)) {
      throw new DomainError('CONFLICT', 'Ya existe un equipo con esa placa SENA.');
    }
    if (await this.equipmentRepository.findByCodigoActivo(codigoActivo)) {
      throw new DomainError('CONFLICT', 'Ya existe un equipo con ese código de activo.');
    }

    return this.equipmentRepository.create({
      placaSena,
      codigoActivo,
      tipo: input.tipo,
      roomId: input.roomId
    });
  }

  public async getEquipment(
    filters: EquipmentFilters = {},
    allowedRoomIds?: string[]
  ): Promise<Equipment[]> {
    if (!allowedRoomIds) {
      return this.equipmentRepository.findAll(filters);
    }

    if (filters.roomId) {
      if (!allowedRoomIds.includes(filters.roomId)) {
        throw new DomainError('FORBIDDEN', 'No tiene permiso sobre esa sala.');
      }
      return this.equipmentRepository.findAll({ roomId: filters.roomId });
    }

    return this.equipmentRepository.findAll({ roomIds: allowedRoomIds });
  }

  private assertRoomAccess(equipment: Equipment, allowedRoomIds?: string[]): void {
    if (allowedRoomIds && !allowedRoomIds.includes(equipment.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre ese equipo.');
    }
  }

  public async updateEquipment(
    id: string,
    changes: EquipmentChanges,
    allowedRoomIds?: string[]
  ): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    this.assertRoomAccess(equipment, allowedRoomIds);

    const updated = await this.equipmentRepository.update(id, changes);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return updated;
  }

  public async moveEquipment(
    id: string,
    input: IMoveEquipmentDTO,
    movedBy: string,
    allowedRoomIds?: string[]
  ): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    this.assertRoomAccess(equipment, allowedRoomIds);

    if (allowedRoomIds && !allowedRoomIds.includes(input.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre la sala destino.');
    }

    if (equipment.roomId === input.roomId) {
      throw new DomainError('VALIDATION_ERROR', 'El equipo ya está en esa sala.');
    }

    const moved = await this.equipmentRepository.move(id, input, movedBy);
    if (!moved) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return moved;
  }
}
