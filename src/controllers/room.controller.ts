import { Request, Response } from 'express';
 
export class RoomController {
  public static getRooms = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El listado de ambientes todavía no está implementado.'
    });
  };
 
  public static createRoom = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El registro de ambientes todavía no está implementado.'
    });
  };
 
  public static updateRoom = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.status(501).json({
      success: false,
      message: `La actualización del ambiente ${id} todavía no está implementada.`
    });
  };
}
 