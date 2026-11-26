import { ICreateLoanDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import { Loan, LoanFilters, LoanRepository } from '../repositories/loan.repository';

export class LoanService {
  constructor(private readonly loanRepository: LoanRepository) {}

  public async createLoan(input: ICreateLoanDTO): Promise<Loan> {
    if (!(await this.loanRepository.isActiveInstructor(input.instructorId))) {
      throw new DomainError(
        'VALIDATION_ERROR',
        'El instructor seleccionado no existe o no está activo.'
      );
    }

    return this.loanRepository.create(input);
  }

  public getLoans(filters: LoanFilters = {}): Promise<Loan[]> {
    return this.loanRepository.findAll(filters);
  }

  public async getLoanDetail(
    id: string,
    ownership: Pick<LoanFilters, 'instructorId' | 'guardaId'> = {}
  ): Promise<Loan> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new DomainError('NOT_FOUND', `No existe un préstamo con identificador ${id}.`);
    }

    if (
      (ownership.instructorId && loan.instructorId !== ownership.instructorId) ||
      (ownership.guardaId && loan.guardaId !== ownership.guardaId)
    ) {
      throw new DomainError('FORBIDDEN', 'No tienes permiso para consultar este préstamo.');
    }

    return loan;
  }

  public async acceptLoan(id: string, instructorId: string): Promise<Loan> {
    await this.getLoanDetail(id, { instructorId });

    const updatedLoan = await this.loanRepository.updateStatus(
      id,
      'PENDIENTE_APROBACION',
      'APROBADO_Y_FIRMADO'
    );
    if (updatedLoan) {
      return updatedLoan;
    }

    const currentLoan = await this.loanRepository.findById(id);
    if (!currentLoan) {
      throw new DomainError('NOT_FOUND', `No existe un préstamo con identificador ${id}.`);
    }
    if (currentLoan.instructorId !== instructorId) {
      throw new DomainError('FORBIDDEN', 'No tienes permiso para aceptar este préstamo.');
    }

    throw new DomainError(
      'CONFLICT',
      'El préstamo ya fue aceptado y no puede aceptarse nuevamente.'
    );
  }
}