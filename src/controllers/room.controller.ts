import { NextFunction, Request, Response } from 'express';
import { roomService } from '../container';
import { ICreateRoomDTO, IUpdateRoomDTO } from '../dtos/room.dtos';

export class RoomController {
  public static getRooms = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rooms = await roomService.getRooms();
      res.status(200).json({ success: true, data: rooms });
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
      const room = await roomService.updateRoom(req.params.id, req.body);
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  };
}