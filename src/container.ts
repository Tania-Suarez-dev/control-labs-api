import { prisma } from './db/prisma';
import { PrismaLoanRepository } from './repositories/prisma-loan.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaRoomRepository } from './repositories/prisma-room.repository';
import { PrismaEquipmentRepository } from './repositories/prisma-equipment.repository';
import { PrismaIncidentRepository } from './repositories/prisma-incident.repository';
import { PrismaDashboardRepository } from './repositories/prisma-dashboard.repository';
import { LoanService } from './services/loan.service';
import { UserService } from './services/user.service';
import { RoomService } from './services/room.service';
import { EquipmentService } from './services/equipment.service';
import { IncidentService } from './services/incident.service';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';

const loanRepository = new PrismaLoanRepository(prisma);
export const loanService = new LoanService(loanRepository);

const userRepository = new PrismaUserRepository(prisma);
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository);

const roomRepository = new PrismaRoomRepository(prisma);
export const roomService = new RoomService(roomRepository);

const equipmentRepository = new PrismaEquipmentRepository(prisma);
export const equipmentService = new EquipmentService(equipmentRepository);

const incidentRepository = new PrismaIncidentRepository(prisma);
export const incidentService = new IncidentService(incidentRepository);

const dashboardRepository = new PrismaDashboardRepository(prisma);
export const dashboardService = new DashboardService(dashboardRepository);