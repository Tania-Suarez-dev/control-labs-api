import { NextFunction, Request, Response } from 'express';
import { equipmentService } from '../container';
import {
  ICreateEquipmentDTO,
  IMoveEquipmentDTO,
  IUpdateEquipmentDTO
} from '../dtos/equipment.dtos';
import { getAllowedRoomIds } from '../utils/access';

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
      const equipment = await equipmentService.getEquipment(
        { roomId: req.query.roomId },
        getAllowedRoomIds(req.user)
      );
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
      const equipment = await equipmentService.updateEquipment(
        req.params.id,
        req.body,
        getAllowedRoomIds(req.user)
      );
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };

  public static moveEquipment = async (
    req: Request<{ id: string }, unknown, IMoveEquipmentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const equipment = await equipmentService.moveEquipment(
        req.params.id,
        req.body,
        req.user!.id,
        getAllowedRoomIds(req.user)
      );
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };
}
