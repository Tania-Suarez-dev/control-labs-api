import { NextFunction, Request, Response } from 'express';
import { userService } from '../container';
import { ICreateUserDTO, IUpdateUserRoleDTO, UserRole } from '../dtos/user.dtos';

export class UserController {
  public static getUsers = async (
    req: Request<Record<string, string>, unknown, unknown, { rol?: string; activo?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await userService.getUsers({
        rol: req.query.rol as UserRole | undefined,
        activo: req.query.activo === undefined ? undefined : req.query.activo === 'true'
      });
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  public static createUser = async (
    req: Request<Record<string, string>, unknown, ICreateUserDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public static getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.getUserDetail(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public static updateUserRole = async (
    req: Request<{ id: string }, unknown, IUpdateUserRoleDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.updateUserRole(req.params.id, req.body.rol);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public static deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}