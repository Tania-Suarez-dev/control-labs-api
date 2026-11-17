import { InMemoryLoanRepository } from './repositories/in-memory-loan.repository';
import { LoanService } from './services/loan.service';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { UserService } from './services/user.service';
import { InMemoryRoomRepository } from './repositories/in-memory-room.repository';
import { RoomService } from './services/room.service';

const loanRepository = new InMemoryLoanRepository();
export const loanService = new LoanService(loanRepository);

const userRepository = new InMemoryUserRepository();
export const userService = new UserService(userRepository);

const roomRepository = new InMemoryRoomRepository();
export const roomService = new RoomService(roomRepository);