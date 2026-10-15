import { Request, Response } from 'express';
 
export class UserController {
  public static getUsers = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El listado de usuarios todavía no está implementado.'
    });
  };
 
  public static createUser = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El registro de usuarios todavía no está implementado.'
    });
  };
 
  public static getUserById = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.status(501).json({
      success: false,
      message: `La consulta del usuario ${id} todavía no está implementada.`
    });
  };
 
  public static updateUserRole = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.status(501).json({
      success: false,
      message: `La actualización del rol del usuario ${id} todavía no está implementada.`
    });
  };
 
  public static deleteUser = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.status(501).json({
      success: false,
      message: `La eliminación del usuario ${id} todavía no está implementada.`
    });
  };
}