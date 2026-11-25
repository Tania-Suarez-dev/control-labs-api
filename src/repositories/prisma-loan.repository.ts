import { Loan as PrismaLoan, PrismaClient } from '@prisma/client';
import { ICreateLoanDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import {
  Loan,
  LoanFilters,
  LoanRepository,
  LoanStatus
} from './loan.repository';

const toLoanStatus = (value: string): LoanStatus => {
  if (value === 'PENDIENTE_APROBACION' || value === 'APROBADO_Y_FIRMADO') {
    return value;
  }
  throw new Error(`Estado de préstamo no reconocido en la base de datos: ${value}`);
};

const getDatabaseCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string') {
    return code;
  }

  const message = error instanceof Error ? error.message : String(error);
  const sqlState = /code:\s*["']?(\d{5})["']?/.exec(message);
  return sqlState?.[1];
};

const translatePersistenceError = (error: unknown): void => {
  const code = getDatabaseCode(error);

  if (code === 'P2003' || code === '23503') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'La sala, el instructor o el guarda indicados no existen.'
    );
  }

  if (code === 'P2004' || code === '23514') {
    throw new DomainError(
      'VALIDATION_ERROR',
      'Los datos del préstamo incumplen una restricción de la base de datos.'
    );
  }
};

export class PrismaLoanRepository implements LoanRepository {
  constructor(private readonly database: PrismaClient) {}

  public async create(input: ICreateLoanDTO): Promise<Loan> {
    try {
      const loan = await this.database.loan.create({
        data: {
          roomId: input.roomId,
          instructorId: input.instructorId,
          guardaId: input.guardaId,
          numeroPc: input.numeroPc
        }
      });
      return this.toDomain(loan);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(filters: LoanFilters = {}): Promise<Loan[]> {
    const loans = await this.database.loan.findMany({
      where: filters.roomId ? { roomId: filters.roomId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return loans.map((loan) => this.toDomain(loan));
  }

  public async findById(id: string): Promise<Loan | null> {
    const loan = await this.database.loan.findUnique({
      where: { id: BigInt(id) }
    });
    return loan ? this.toDomain(loan) : null;
  }

  public async updateStatus(
    id: string,
    expectedStatus: LoanStatus,
    status: LoanStatus
  ): Promise<Loan | null> {
    try {
      const result = await this.database.loan.updateMany({
        where: {
          id: BigInt(id),
          estado: expectedStatus
        },
        data: {
          estado: status,
          acceptedAt:
            status === 'APROBADO_Y_FIRMADO' ? new Date() : null
        }
      });

      return result.count === 0 ? null : this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(loan: PrismaLoan): Loan {
    return {
      id: loan.id.toString(),
      roomId: loan.roomId,
      instructorId: loan.instructorId,
      guardaId: loan.guardaId,
      numeroPc: loan.numeroPc,
      estado: toLoanStatus(loan.estado),
      createdAt: loan.createdAt.toISOString(),
      acceptedAt: loan.acceptedAt?.toISOString() ?? null
    };
  }
}