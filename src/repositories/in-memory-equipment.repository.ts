import { randomUUID } from 'crypto';
import { ICreateEquipmentDTO } from '../dtos/equipment.dtos';
import { Equipment, EquipmentChanges, EquipmentFilters, EquipmentRepository } from './equipment.repository';

export class InMemoryEquipmentRepository implements EquipmentRepository {
  private readonly equipment = new Map<string, Equipment>();

  public async create(input: ICreateEquipmentDTO): Promise<Equipment> {
    const item: Equipment = {
      ...input,
      id: randomUUID(),
      estado: 'OPERATIVO'
    };
    this.equipment.set(item.id, item);
    return { ...item };
  }

  public async findAll(filters: EquipmentFilters = {}): Promise<Equipment[]> {
    return [...this.equipment.values()]
      .filter((item) => filters.roomId === undefined || item.roomId === filters.roomId)
      .map((item) => ({ ...item }));
  }

  public async findByPlacaSena(placaSena: string): Promise<Equipment | null> {
    const item = [...this.equipment.values()].find((equipment) => equipment.placaSena === placaSena);
    return item ? { ...item } : null;
  }

  public async findByCodigoActivo(codigoActivo: string): Promise<Equipment | null> {
    const item = [...this.equipment.values()].find((equipment) => equipment.codigoActivo === codigoActivo);
    return item ? { ...item } : null;
  }

  public async update(id: string, changes: EquipmentChanges): Promise<Equipment | null> {
    const item = this.equipment.get(id);
    if (!item) {
      return null;
    }
    if (changes.estado !== undefined) {
      item.estado = changes.estado;
    }
    if (changes.roomId !== undefined) {
      item.roomId = changes.roomId;
    }
    return { ...item };
  }
}