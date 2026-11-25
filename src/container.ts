import { prisma } from './db/prisma';
import { PrismaLoanRepository } from './repositories/prisma-loan.repository';
import { LoanService } from './services/loan.service';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { UserService } from './services/user.service';
import { InMemoryRoomRepository } from './repositories/in-memory-room.repository';
import { RoomService } from './services/room.service';
import { InMemoryEquipmentRepository } from './repositories/in-memory-equipment.repository';
import { EquipmentService } from './services/equipment.service';
import { InMemoryIncidentRepository } from './repositories/in-memory-incident.repository';
import { IncidentService } from './services/incident.service';

const loanRepository = new PrismaLoanRepository(prisma);
export const loanService = new LoanService(loanRepository);

const userRepository = new InMemoryUserRepository();
export const userService = new UserService(userRepository);

const roomRepository = new InMemoryRoomRepository();
export const roomService = new RoomService(roomRepository);

const equipmentRepository = new InMemoryEquipmentRepository();
export const equipmentService = new EquipmentService(equipmentRepository);

const incidentRepository = new InMemoryIncidentRepository();
export const incidentService = new IncidentService(incidentRepository);