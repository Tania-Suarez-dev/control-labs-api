import { NextFunction, Request, Response } from 'express';
import { incidentService } from '../container';
import { ICreateIncidentDTO, IUpdateIncidentDTO } from '../dtos/incident.dtos';

export class IncidentController {
  public static createIncident = async (
    req: Request<Record<string, string>, unknown, ICreateIncidentDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const incident = await incidentService.createIncident(req.body);
      res.status(201).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };

  public static getIncidents = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const incidents = await incidentService.getIncidents();
      res.status(200).json({ success: true, data: incidents });
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
        req.body.estado
      );
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  };
}