import { prisma } from './db/prisma';
import { PrismaLoanRepository } from './repositories/prisma-loan.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaRoomRepository } from './repositories/prisma-room.repository';
import { LoanService } from './services/loan.service';
import { UserService } from './services/user.service';
import { RoomService } from './services/room.service';
import { InMemoryEquipmentRepository } from './repositories/in-memory-equipment.repository';
import { EquipmentService } from './services/equipment.service';
import { InMemoryIncidentRepository } from './repositories/in-memory-incident.repository';
import { IncidentService } from './services/incident.service';

const loanRepository = new PrismaLoanRepository(prisma);
export const loanService = new LoanService(loanRepository);

const userRepository = new PrismaUserRepository(prisma);
export const userService = new UserService(userRepository);

const roomRepository = new PrismaRoomRepository(prisma);
export const roomService = new RoomService(roomRepository);

const equipmentRepository = new InMemoryEquipmentRepository();
export const equipmentService = new EquipmentService(equipmentRepository);

const incidentRepository = new InMemoryIncidentRepository();
export const incidentService = new IncidentService(incidentRepository);