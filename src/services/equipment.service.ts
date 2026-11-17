import { EQUIPMENT_STATUSES, EquipmentStatus, ICreateEquipmentDTO } from '../dtos/equipment.dtos';
import { DomainError } from '../errors/domain.error';
import { Equipment, EquipmentChanges, EquipmentRepository } from '../repositories/equipment.repository';

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
      roomId: input.roomId.toLowerCase()
    });
  }

  public async getEquipment(filters: { roomId?: string } = {}): Promise<Equipment[]> {
    if (filters.roomId !== undefined && !this.isUuid(filters.roomId)) {
      throw new DomainError('VALIDATION_ERROR', 'El filtro roomId debe ser un UUID válido.');
    }
    return this.equipmentRepository.findAll({ roomId: filters.roomId?.toLowerCase() });
  }

  public async updateEquipment(
    id: string,
    changes: { estado?: string; roomId?: string }
  ): Promise<Equipment> {
    if (!this.isUuid(id)) {
      throw new DomainError('VALIDATION_ERROR', 'El identificador del equipo debe ser un UUID válido.');
    }

    if (changes.estado === undefined && changes.roomId === undefined) {
      throw new DomainError('VALIDATION_ERROR', 'Debe enviar estado o roomId.');
    }

    const validChanges: EquipmentChanges = {};
    if (changes.estado !== undefined) {
      validChanges.estado = this.validateStatus(changes.estado);
    }
    if (changes.roomId !== undefined) {
      if (!this.isUuid(changes.roomId)) {
        throw new DomainError('VALIDATION_ERROR', 'El campo roomId debe ser un UUID válido.');
      }
      validChanges.roomId = changes.roomId.toLowerCase();
    }

    const updatedEquipment = await this.equipmentRepository.update(id.toLowerCase(), validChanges);
    if (!updatedEquipment) {
      throw new DomainError('NOT_FOUND', `No existe un equipo con identificador ${id}.`);
    }
    return updatedEquipment;
  }

  private validateStatus(estado: string): EquipmentStatus {
    if (!(EQUIPMENT_STATUSES as readonly string[]).includes(estado)) {
      throw new DomainError('VALIDATION_ERROR', 'El estado debe ser OPERATIVO, MANTENIMIENTO o FUERA_DE_SERVICIO.');
    }
    return estado as EquipmentStatus;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}