import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';

const router = Router();

router.get('/', IncidentController.getIncidents);
router.post('/', IncidentController.createIncident);
router.patch('/:id', IncidentController.updateIncident);

export default router;