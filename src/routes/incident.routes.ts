import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { validateCreateIncidentPayload } from '../middlewares/validateIncident.middleware';

const router = Router();

router.get('/', IncidentController.getIncidents);
router.post('/', validateCreateIncidentPayload, IncidentController.createIncident);
router.patch('/:id', IncidentController.updateIncident);

export default router;