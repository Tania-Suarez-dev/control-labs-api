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

  public getEquipment(filters: EquipmentFilters = {}): Promise<Equipment[]> {
    return this.equipmentRepository.findAll(filters);
  }

  public async updateEquipment(id: string, changes: EquipmentChanges): Promise<Equipment> {
    const updated = await this.equipmentRepository.update(id, changes);
    if (!updated) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return updated;
  }
}