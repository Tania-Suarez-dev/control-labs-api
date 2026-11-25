import { Request, Response } from 'express';
import { incidentService } from '../container';
import { DomainError } from '../errors/domain.error';
import { ICreateIncidentDTO } from '../dtos/incident.dtos';

export class IncidentController {
  public static createIncident = async (
    req: Request<Record<string, string>, unknown, ICreateIncidentDTO>,
    res: Response
  ): Promise<void> => {
    const incident = await incidentService.createIncident(req.body);
    res.status(201).json({ success: true, data: incident });
  };

  public static getIncidents = async (req: Request, res: Response): Promise<void> => {
    const incidents = await incidentService.getIncidents();
    res.status(200).json({ success: true, data: incidents });
  };

  public static updateIncident = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { estado } = (req.body ?? {}) as { estado?: unknown };
    if (typeof estado !== 'string') {
      throw new DomainError('VALIDATION_ERROR', 'El campo estado es obligatorio y debe ser un texto.');
    }

    const incident = await incidentService.updateIncidentStatus(Number(req.params.id), estado);
    res.status(200).json({ success: true, data: incident });
  };
}