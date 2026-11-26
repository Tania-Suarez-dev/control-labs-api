import { NextFunction, Request, Response } from 'express';
import { equipmentService } from '../container';
import { ICreateEquipmentDTO, IUpdateEquipmentDTO } from '../dtos/equipment.dtos';

export class EquipmentController {
  public static createEquipment = async (
    req: Request<Record<string, string>, unknown, ICreateEquipmentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const equipment = await equipmentService.createEquipment(req.body);
      res.status(201).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };

  public static getEquipment = async (
    req: Request<Record<string, string>, unknown, unknown, { roomId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const equipment = await equipmentService.getEquipment({
        roomId: req.query.roomId
      });
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };

  public static updateEquipment = async (
    req: Request<{ id: string }, unknown, IUpdateEquipmentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const equipment = await equipmentService.updateEquipment(req.params.id, req.body);
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };
}