import { Request, Response } from 'express';

export class DashboardController {
  public static getSummary = (_req: Request, res: Response): void => {
    res.status(501).json({
      success: false,
      message: 'El resumen del panel todavía no está implementado.'
    });
  };
}