import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  validateCreateIncidentPayload,
  validateIncidentCommentPayload,
  validateIncidentIdParameter,
  validateIncidentSearchQuery,
  validateUpdateIncidentPayload
} from '../middlewares/validateIncident.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validateIncidentSearchQuery, IncidentController.getIncidents);
router.post('/', validateCreateIncidentPayload, IncidentController.createIncident);
router.get('/:id', validateIncidentIdParameter, IncidentController.getIncidentById);
router.patch(
  '/:id',
  authorize('ADMIN', 'GUARDA'),
  validateIncidentIdParameter,
  validateUpdateIncidentPayload,
  IncidentController.updateIncident
);
router.post(
  '/:id/comments',
  validateIncidentIdParameter,
  validateIncidentCommentPayload,
  IncidentController.addComment
);
router.post(
  '/:id/resolve',
  authorize('ADMIN', 'GUARDA'),
  validateIncidentIdParameter,
  validateIncidentCommentPayload,
  IncidentController.resolveIncident
);

export default router;
