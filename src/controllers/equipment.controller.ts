import { Request, Response } from 'express';
import { equipmentService } from '../container';
import { DomainError } from '../errors/domain.error';
import { ICreateEquipmentDTO } from '../dtos/equipment.dtos';

export class EquipmentController {
  public static createEquipment = async (
    req: Request<Record<string, string>, unknown, ICreateEquipmentDTO>,
    res: Response
  ): Promise<void> => {
    const equipment = await equipmentService.createEquipment(req.body);
    res.status(201).json({ success: true, data: equipment });
  };

  public static getEquipment = async (req: Request, res: Response): Promise<void> => {
    const { roomId } = req.query;
    if (roomId !== undefined && typeof roomId !== 'string') {
      throw new DomainError('VALIDATION_ERROR', 'El filtro roomId debe ser un texto.');
    }

    const equipment = await equipmentService.getEquipment({ roomId });
    res.status(200).json({ success: true, data: equipment });
  };

  public static updateEquipment = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { estado, roomId } = (req.body ?? {}) as { estado?: unknown; roomId?: unknown };

    if (estado !== undefined && typeof estado !== 'string') {
      throw new DomainError('VALIDATION_ERROR', 'El campo estado debe ser un texto.');
    }
    if (roomId !== undefined && typeof roomId !== 'string') {
      throw new DomainError('VALIDATION_ERROR', 'El campo roomId debe ser un texto.');
    }

    const equipment = await equipmentService.updateEquipment(req.params.id, { estado, roomId });
    res.status(200).json({ success: true, data: equipment });
  };
}