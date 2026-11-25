import { Router } from 'express';
import loanRoutes from './loan.routes';
import userRoutes from './user.routes';
import roomRoutes from './room.routes';
import equipmentRoutes from './equipment.routes';
import incidentRoutes from './incident.routes';
 
const router = Router();
router.use('/loans', loanRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/equipments', equipmentRoutes);
router.use('/incidents', incidentRoutes);
 
export default router;