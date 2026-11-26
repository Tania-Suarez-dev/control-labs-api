import { ICreateLoanDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import { Loan, LoanFilters, LoanRepository } from '../repositories/loan.repository';

export class LoanService {
  constructor(private readonly loanRepository: LoanRepository) {}

  public async createLoan(input: ICreateLoanDTO, guardaId: string): Promise<Loan> {
    if (!Array.isArray(input.equipmentIds) || input.equipmentIds.length === 0) {
      throw new DomainError('VALIDATION_ERROR', 'Debe indicar al menos un equipo.');
    }
    if (new Set(input.equipmentIds).size !== input.equipmentIds.length) {
      throw new DomainError('VALIDATION_ERROR', 'Los equipos no deben repetirse.');
    }
    return this.loanRepository.create(input, guardaId);
  }

  public async getLoans(
    filters: LoanFilters = {},
    allowedRoomIds?: string[]
  ): Promise<Loan[]> {
    if (!allowedRoomIds) {
      return this.loanRepository.findAll(filters);
    }

    if (filters.roomId) {
      if (!allowedRoomIds.includes(filters.roomId)) {
        throw new DomainError('FORBIDDEN', 'No tiene permiso sobre esa sala.');
      }
      return this.loanRepository.findAll({ roomId: filters.roomId });
    }

    return this.loanRepository.findAll({ roomIds: allowedRoomIds });
  }

  public async getLoanDetail(id: string, allowedRoomIds?: string[]): Promise<Loan> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new DomainError('NOT_FOUND', `No existe un préstamo con identificador ${id}.`);
    }
    if (allowedRoomIds && !allowedRoomIds.includes(loan.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre ese préstamo.');
    }
    return loan;
  }

  public async acceptLoan(
    id: string,
    guardaId: string,
    allowedRoomIds?: string[]
  ): Promise<Loan> {
    const current = await this.loanRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe un préstamo con identificador ${id}.`);
    }
    if (allowedRoomIds && !allowedRoomIds.includes(current.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre ese préstamo.');
    }

    const updated = await this.loanRepository.accept(id, guardaId);
    if (updated) {
      return updated;
    }
    throw new DomainError('CONFLICT', 'El préstamo ya fue aceptado.');
  }

  public async returnLoan(id: string, allowedRoomIds?: string[]): Promise<Loan> {
    const current = await this.loanRepository.findById(id);
    if (!current) {
      throw new DomainError('NOT_FOUND', `No existe un préstamo con identificador ${id}.`);
    }
    if (allowedRoomIds && !allowedRoomIds.includes(current.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre ese préstamo.');
    }

    const updated = await this.loanRepository.returnEquipment(id);
    if (updated) {
      return updated;
    }
    throw new DomainError('NOT_FOUND', 'No existe el préstamo.');
  }
}
