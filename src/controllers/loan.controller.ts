import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../auth-container';
import { loanService } from '../container';
import { ICreateLoanRequestDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import { getAllowedRoomIds } from '../utils/access';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new DomainError('UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.user;
};

const ownershipFor = (user: ReturnType<typeof requireUser>) =>
  user.rol === 'INSTRUCTOR'
    ? { instructorId: user.id }
    : user.rol === 'GUARDA'
      ? { guardaId: user.id }
      : {};

export class LoanController {
  public static createLoan = async (
    req: Request<Record<string, string>, unknown, ICreateLoanRequestDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);

      if (allowedRoomIds && !allowedRoomIds.includes(req.body.roomId)) {
        throw new DomainError('FORBIDDEN', 'No tienes permiso sobre esa sala.');
      }

      const loan = await loanService.createLoan({
        ...req.body,
        guardaId: user.id
      });

      res.status(201).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  };

  public static getLoansByFilter = async (
    req: Request<Record<string, string>, unknown, unknown, { roomId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);

      const loans = await loanService.getLoans(
        { roomId: req.query.roomId, ...ownershipFor(user) },
        allowedRoomIds
      );

      res.status(200).json({ success: true, data: loans });
    } catch (error) {
      next(error);
    }
  };

  public static getLoanById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);

      const loan = await loanService.getLoanDetail(
        req.params.id,
        ownershipFor(user),
        allowedRoomIds
      );

      res.status(200).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  };

  public static acceptLoanInventory = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);

      const loan = await loanService.acceptLoan(req.params.id, user.id, allowedRoomIds);

      res.status(200).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  };

  public static returnLoan = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);

      const loan = await loanService.returnLoan(req.params.id, allowedRoomIds);

      res.status(200).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  };
}
