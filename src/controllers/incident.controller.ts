import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../auth-container';
import { incidentService } from '../container';
import {
  ICreateIncidentCommentDTO,
  ICreateIncidentDTO,
  IUpdateIncidentDTO,
  IncidentStatus
} from '../dtos/incident.dtos';
import { DomainError } from '../errors/domain.error';
import { getAllowedRoomIds } from '../utils/access';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new DomainError('UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.user;
};

export class IncidentController {
  public static createIncident = async (
    req: Request<Record<string, string>, unknown, ICreateIncidentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incident = await incidentService.createIncident(
        req.body,
        user.id,
        allowedRoomIds
      );
      res.status(201).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };

  public static getIncidents = async (
    req: Request<
      Record<string, string>,
      unknown,
      unknown,
      { roomId?: string; estado?: string }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incidents = await incidentService.getIncidents(
        {
          roomId: req.query.roomId,
          estado: req.query.estado as IncidentStatus | undefined
        },
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: incidents });
    } catch (error) {
      next(error);
    }
  };

  public static getIncidentById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incident = await incidentService.getIncidentDetail(
        req.params.id,
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };

  public static updateIncident = async (
    req: Request<{ id: string }, unknown, IUpdateIncidentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incident = await incidentService.updateIncidentStatus(
        req.params.id,
        req.body.estado,
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };

  public static addComment = async (
    req: Request<{ id: string }, unknown, ICreateIncidentCommentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incident = await incidentService.addComment(
        req.params.id,
        user.id,
        req.body.contenido,
        allowedRoomIds
      );
      res.status(201).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };

  public static resolveIncident = async (
    req: Request<{ id: string }, unknown, ICreateIncidentCommentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const allowedRoomIds = await getAllowedRoomIds(user, userRepository);
      const incident = await incidentService.resolveIncident(
        req.params.id,
        user.id,
        req.body.contenido,
        allowedRoomIds
      );
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };
}
