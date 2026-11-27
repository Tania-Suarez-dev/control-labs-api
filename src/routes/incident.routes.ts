import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validateCreateIncidentPayload,
  validateIncidentCommentPayload,
  validateIncidentIdParameter,
  validateIncidentSearchQuery,
  validateUpdateIncidentPayload
} from '../middlewares/validateIncident.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateIncidentSearchQuery,
  IncidentController.getIncidents
);

router.post(
  '/',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateCreateIncidentPayload,
  IncidentController.createIncident
);

router.post(
  '/:id/comments',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
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

router.get(
  '/:id',
  authorize('ADMIN', 'GUARDA', 'INSTRUCTOR'),
  validateIncidentIdParameter,
  IncidentController.getIncidentById
);

router.patch(
  '/:id',
  authorize('ADMIN', 'GUARDA'),
  validateIncidentIdParameter,
  validateUpdateIncidentPayload,
  IncidentController.updateIncident
);

export default router;
