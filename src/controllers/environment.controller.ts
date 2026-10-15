import { Request, Response } from 'express';
 
export class EnvironmentController {
  public static getEnvironments = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El listado de ambientes todavía no está implementado.'
    });
  };
 
  public static createEnvironment = (req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El registro de ambientes todavía no está implementado.'
    });
  };
 
  public static updateEnvironment = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.status(501).json({
      success: false,
      message: `La actualización del ambiente ${id} todavía no está implementada.`
    });
  };
}
 