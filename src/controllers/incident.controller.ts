import { NextFunction, Request, Response } from 'express';
import { incidentService } from '../container';
import {
  ICreateIncidentCommentDTO,
  ICreateIncidentDTO,
  IncidentStatus,
  IUpdateIncidentDTO
} from '../dtos/incident.dtos';
import { getAllowedRoomIds } from '../utils/access';

export class IncidentController {
  public static createIncident = async (
    req: Request<Record<string, string>, unknown, ICreateIncidentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const incident = await incidentService.createIncident(req.body, req.user!.id);
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
      const incidents = await incidentService.getIncidents(
        {
          roomId: req.query.roomId,
          estado: req.query.estado as IncidentStatus | undefined
        },
        getAllowedRoomIds(req.user)
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
      const incident = await incidentService.getIncidentDetail(
        req.params.id,
        getAllowedRoomIds(req.user)
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
      const incident = await incidentService.updateIncidentStatus(
        req.params.id,
        req.body.estado,
        getAllowedRoomIds(req.user)
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
      const incident = await incidentService.addComment(
        req.params.id,
        req.user!.id,
        req.body.contenido,
        getAllowedRoomIds(req.user)
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
      const incident = await incidentService.resolveIncident(
        req.params.id,
        req.user!.id,
        req.body.contenido,
        getAllowedRoomIds(req.user)
      );
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };
}
