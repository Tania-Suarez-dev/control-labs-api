import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../auth-container';
import { equipmentService } from '../container';
import {
  ICreateEquipmentDTO,
  IMoveEquipmentDTO,
  IUpdateEquipmentDTO
} from '../dtos/equipment.dtos';
import { DomainError } from '../errors/domain.error';
import { getAllowedRoomIds } from '../utils/access';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new DomainError('UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.user;
};

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
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const equipment = await equipmentService.getEquipment(
        { roomId: req.query.roomId },
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };

  public static getEquipmentById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const equipment = await equipmentService.getEquipmentById(
        req.params.id,
        allowedRoomIds
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
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const equipment = await equipmentService.updateEquipment(
        req.params.id,
        req.body,
        allowedRoomIds
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
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const equipment = await equipmentService.moveEquipment(
        req.params.id,
        req.body.roomId,
        user.id,
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  };
}
