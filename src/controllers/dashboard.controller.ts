import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../auth-container';
import { dashboardService } from '../container';
import { DomainError } from '../errors/domain.error';
import { getAllowedRoomIds } from '../utils/access';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new DomainError('UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.user;
};

export class DashboardController {
  public static getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const summary = await dashboardService.getSummary(allowedRoomIds);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };
}
