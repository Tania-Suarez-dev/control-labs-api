import { Request, Response } from 'express';
import { roomService } from '../container';
import { DomainError } from '../errors/domain.error';
import { ICreateRoomDTO } from '../dtos/room.dtos';

export class RoomController {
  public static getRooms = async (req: Request, res: Response): Promise<void> => {
    const rooms = await roomService.getRooms();
    res.status(200).json({ success: true, data: rooms });
  };

  public static createRoom = async (
    req: Request<Record<string, string>, unknown, ICreateRoomDTO>,
    res: Response
  ): Promise<void> => {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({ success: true, data: room });
  };

  public static updateRoom = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { capacidadPcs, estado } = (req.body ?? {}) as { capacidadPcs?: unknown; estado?: unknown };

    if (capacidadPcs !== undefined && typeof capacidadPcs !== 'number') {
      throw new DomainError('VALIDATION_ERROR', 'El campo capacidadPcs debe ser un número.');
    }
    if (estado !== undefined && typeof estado !== 'string') {
      throw new DomainError('VALIDATION_ERROR', 'El campo estado debe ser un texto.');
    }

    const room = await roomService.updateRoom(req.params.id, { capacidadPcs, estado });
    res.status(200).json({ success: true, data: room });
  };
}