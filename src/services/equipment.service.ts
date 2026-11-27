import { ICreateEquipmentDTO } from '../dtos/equipment.dtos';
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
    if (filters.roomId && allowedRoomIds && !allowedRoomIds.includes(filters.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tienes acceso a esa sala.');
    }

    return this.equipmentRepository.findAll(filters, allowedRoomIds);
  }

  public async getEquipmentById(
    id: string,
    allowedRoomIds?: string[]
  ): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }

    if (allowedRoomIds && !allowedRoomIds.includes(equipment.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tienes acceso a este equipo.');
    }

    return equipment;
  }

  public async updateEquipment(
    id: string,
    changes: EquipmentChanges,
    allowedRoomIds?: string[]
  ): Promise<Equipment> {
    if (allowedRoomIds) {
      const current = await this.equipmentRepository.findById(id);
      if (!current) {
        throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
      }
      if (!allowedRoomIds.includes(current.roomId)) {
        throw new DomainError('FORBIDDEN', 'No tienes acceso a este equipo.');
      }
    }

    const updated = await this.equipmentRepository.update(id, changes);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return updated;
  }

  public async moveEquipment(
    id: string,
    roomId: string,
    movedBy: string,
    allowedRoomIds?: string[]
  ): Promise<Equipment> {
    if (allowedRoomIds && !allowedRoomIds.includes(roomId)) {
      throw new DomainError('FORBIDDEN', 'No tienes acceso a la sala destino.');
    }

    const current = await this.equipmentRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }

    if (allowedRoomIds && !allowedRoomIds.includes(current.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tienes acceso a este equipo.');
    }

    const updated = await this.equipmentRepository.move(id, roomId, movedBy);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return updated;
  }
}
