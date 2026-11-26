import { ICreateLoanDTO } from '../dtos/loan.dto';

export type LoanStatus = 'PENDIENTE_APROBACION' | 'APROBADO_Y_FIRMADO';

export interface Loan extends ICreateLoanDTO {
  id: string;
  guardaId: string;
  estado: LoanStatus;
  createdAt: string;
  acceptedAt: string | null;
  equipmentIds: string[];
  returnedAt: string | null;
}

export interface LoanFilters {
  roomId?: string;
  roomIds?: string[];
}

export interface LoanRepository {
  create(input: ICreateLoanDTO, guardaId: string): Promise<Loan>;
  findAll(filters?: LoanFilters): Promise<Loan[]>;
  findById(id: string): Promise<Loan | null>;
  accept(id: string, guardaId: string): Promise<Loan | null>;
  returnEquipment(id: string): Promise<Loan | null>;
}
