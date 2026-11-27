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

    if (!Array.isArray(input.equipmentIds) || input.equipmentIds.length === 0) {
      throw new DomainError('VALIDATION_ERROR', 'Debe indicar al menos un equipo.');
    }

    if (new Set(input.equipmentIds).size !== input.equipmentIds.length) {
      throw new DomainError('VALIDATION_ERROR', 'Los equipos no deben repetirse.');
    }

    const room = await this.loanRepository.findRoomById(input.roomId);
    if (!room) {
      throw new DomainError('VALIDATION_ERROR', 'La sala indicada no existe.');
    }

    if (room.estado !== 'OPERATIVO') {
      throw new DomainError('VALIDATION_ERROR', 'La sala no está operativa.');
    }

    const refs = await this.loanRepository.findEquipmentReferences(input.equipmentIds);
    if (refs.length !== input.equipmentIds.length) {
      throw new DomainError('VALIDATION_ERROR', 'Uno o más equipos no existen.');
    }

    const noOperativos = refs.filter((ref) => ref.estado !== 'OPERATIVO');
    if (noOperativos.length > 0) {
      throw new DomainError(
        'VALIDATION_ERROR',
        'Solo se pueden prestar equipos en estado OPERATIVO.'
      );
    }

    const fueraDeSala = refs.find((ref) => ref.roomId !== input.roomId);
    if (fueraDeSala) {
      throw new DomainError(
        'VALIDATION_ERROR',
        'Todos los equipos deben pertenecer a la sala del préstamo.'
      );
    }

    const activos = await this.loanRepository.findActiveEquipmentIds(input.equipmentIds);
    if (activos.length > 0) {
      throw new DomainError(
        'CONFLICT',
        'Uno o más equipos ya están en un préstamo activo.'
      );
    }

    return this.loanRepository.create(input);
  }

  public async getLoans(
    filters: LoanFilters = {},
    allowedRoomIds?: string[]
  ): Promise<Loan[]> {
    const loans = await this.loanRepository.findAll(filters);

    if (!allowedRoomIds) {
      return loans;
    }

    return loans.filter((loan) => allowedRoomIds.includes(loan.roomId));
  }

  public async getLoanDetail(
    id: string,
    ownership: Pick<LoanFilters, 'instructorId' | 'guardaId'> = {},
    allowedRoomIds?: string[]
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

    if (allowedRoomIds && !allowedRoomIds.includes(loan.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre la sala del préstamo.');
    }

    return loan;
  }

  public async acceptLoan(
    id: string,
    guardaId: string,
    allowedRoomIds?: string[]
  ): Promise<Loan> {
    const loan = await this.getLoanDetail(id, {}, allowedRoomIds);

    if (loan.estado !== 'PENDIENTE_APROBACION') {
      throw new DomainError(
        'CONFLICT',
        'El préstamo ya fue aceptado y no puede aceptarse nuevamente.'
      );
    }

    const updated = await this.loanRepository.acceptLoan(id, guardaId, allowedRoomIds);
    if (!updated) {
      throw new DomainError('CONFLICT', 'El préstamo ya no está pendiente de aprobación.');
    }

    return updated;
  }

  public async returnLoan(
    id: string,
    allowedRoomIds?: string[]
  ): Promise<Loan> {
    const loan = await this.getLoanDetail(id, {}, allowedRoomIds);

    if (loan.estado !== 'APROBADO_Y_FIRMADO' || loan.returnedAt !== null) {
      throw new DomainError(
        'CONFLICT',
        'El préstamo no está listo para devolución o ya fue devuelto.'
      );
    }

    const updated = await this.loanRepository.returnLoan(id, allowedRoomIds);
    if (!updated) {
      throw new DomainError('CONFLICT', 'No fue posible devolver el préstamo.');
    }

    return updated;
  }
}
