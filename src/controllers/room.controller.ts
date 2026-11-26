import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../auth-container';
import { roomService } from '../container';
import { ICreateRoomDTO, IUpdateRoomDTO } from '../dtos/room.dtos';
import { DomainError } from '../errors/domain.error';
import { getAllowedRoomIds } from '../utils/access';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new DomainError('UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.user;
};

export class RoomController {
  public static getRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const rooms = await roomService.getRooms(allowedRoomIds);
      res.status(200).json({ success: true, data: rooms });
    } catch (error) {
      next(error);
    }
  };

  public static getRoomById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const room = await roomService.getRoomById(req.params.id, allowedRoomIds);
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  };

  public static createRoom = async (
    req: Request<Record<string, string>, unknown, ICreateRoomDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const room = await roomService.createRoom(req.body);
      res.status(201).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  };

  public static updateRoom = async (
    req: Request<{ id: string }, unknown, IUpdateRoomDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const room = await roomService.updateRoom(
        req.params.id,
        req.body,
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  };
}
