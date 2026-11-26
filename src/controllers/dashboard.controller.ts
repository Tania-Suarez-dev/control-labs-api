import { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../container';

export class DashboardController {
  public static getSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await dashboardService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };
}