import { Request, Response } from 'express';

export class AuthController {
  public static me = (req: Request, res: Response): void => {
    res.status(200).json({ success: true, data: req.user ?? null });
  };
}