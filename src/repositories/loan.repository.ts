import { ICreateLoanDTO } from '../dtos/loan.dto';

export type LoanStatus = 'PENDIENTE_APROBACION' | 'APROBADO_Y_FIRMADO';

export interface Loan extends ICreateLoanDTO {
  id: string;
  estado: LoanStatus;
  createdAt: string;
  acceptedAt: string | null;
  acceptedByGuardId: string | null;
  returnedAt: string | null;
}

export interface LoanFilters {
  roomId?: string;
  instructorId?: string;
  guardaId?: string;
}

export interface EquipmentLoanRef {
  id: string;
  roomId: string;
  estado: string;
}

export interface RoomRef {
  id: string;
  estado: string;
}

export interface LoanRepository {
  create(input: ICreateLoanDTO): Promise<Loan>;
  findAll(filters?: LoanFilters): Promise<Loan[]>;
  findById(id: string): Promise<Loan | null>;
  findRoomById(id: string): Promise<RoomRef | null>;
  findEquipmentReferences(equipmentIds: string[]): Promise<EquipmentLoanRef[]>;
  findActiveEquipmentIds(equipmentIds: string[]): Promise<string[]>;
  acceptLoan(
    id: string,
    guardaId: string,
    allowedRoomIds?: string[]
  ): Promise<Loan | null>;
  returnLoan(id: string, allowedRoomIds?: string[]): Promise<Loan | null>;
  isActiveInstructor(id: string): Promise<boolean>;
}
