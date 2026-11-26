import { Loan as PrismaLoan, PrismaClient } from '@prisma/client';
import { ICreateLoanDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import {
  Loan,
  LoanFilters,
  LoanRepository,
  LoanStatus
} from './loan.repository';

type LoanWithEquipment = PrismaLoan & {
  loanItems: Array<{ equipmentId: string; returnedAt: Date | null }>;
};

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
      'La sala, el instructor, el guarda o el equipo indicado no existe.'
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

  public async create(input: ICreateLoanDTO, guardaId: string): Promise<Loan> {
    try {
      return await this.database.$transaction(async (tx) => {
        const equipmentIds = [...new Set(input.equipmentIds)];

        const equipment = await tx.equipment.findMany({
          where: { id: { in: equipmentIds } },
          select: { id: true, roomId: true }
        });
        if (equipment.length !== equipmentIds.length) {
          throw new DomainError('VALIDATION_ERROR', 'Uno de los equipos indicados no existe.');
        }
        if (equipment.some((item) => item.roomId !== input.roomId)) {
          throw new DomainError(
            'VALIDATION_ERROR',
            'Los equipos deben pertenecer a la sala del préstamo.'
          );
        }

        const activeLoans = await tx.loanEquipment.findMany({
          where: {
            equipmentId: { in: equipmentIds },
            returnedAt: null
          },
          select: { equipmentId: true }
        });
        if (activeLoans.length > 0) {
          throw new DomainError('CONFLICT', 'Uno de los equipos ya está prestado.');
        }

        const loan = await tx.loan.create({
          data: {
            roomId: input.roomId,
            instructorId: input.instructorId,
            guardaId,
            numeroPc: input.numeroPc,
            loanItems: {
              create: equipmentIds.map((equipmentId) => ({ equipmentId }))
            }
          }
        });

        const created = await tx.loan.findUniqueOrThrow({
          where: { id: loan.id },
          include: { loanItems: { orderBy: { equipmentId: 'asc' } } }
        });
        return this.toDomain(created as LoanWithEquipment);
      });
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(filters: LoanFilters = {}): Promise<Loan[]> {
    const loans = await this.database.loan.findMany({
      where: filters.roomIds
        ? { roomId: { in: filters.roomIds } }
        : { roomId: filters.roomId },
      orderBy: { createdAt: 'desc' },
      include: { loanItems: { orderBy: { equipmentId: 'asc' } } }
    });
    return loans.map((loan) => this.toDomain(loan as LoanWithEquipment));
  }

  public async findById(id: string): Promise<Loan | null> {
    const loan = await this.database.loan.findUnique({
      where: { id: BigInt(id) },
      include: { loanItems: { orderBy: { equipmentId: 'asc' } } }
    });
    return loan ? this.toDomain(loan as LoanWithEquipment) : null;
  }

  public async accept(id: string, guardaId: string): Promise<Loan | null> {
    try {
      const result = await this.database.loan.updateMany({
        where: {
          id: BigInt(id),
          estado: 'PENDIENTE_APROBACION'
        },
        data: {
          estado: 'APROBADO_Y_FIRMADO',
          acceptedAt: new Date(),
          guardaId
        }
      });
      return result.count === 0 ? null : this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async returnEquipment(id: string): Promise<Loan | null> {
    try {
      const loan = await this.findById(id);
      if (!loan) {
        return null;
      }
      if (loan.estado !== 'APROBADO_Y_FIRMADO') {
        throw new DomainError('CONFLICT', 'El préstamo todavía no fue aprobado.');
      }
      if (loan.returnedAt) {
        throw new DomainError('CONFLICT', 'El préstamo ya fue devuelto.');
      }

      await this.database.loanEquipment.updateMany({
        where: {
          loanId: BigInt(id),
          returnedAt: null
        },
        data: { returnedAt: new Date() }
      });

      return this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(loan: LoanWithEquipment): Loan {
    const returnedDates = loan.loanItems
      .map((item) => item.returnedAt)
      .filter((date): date is Date => date !== null)
      .map((date) => date.getTime());

    return {
      id: loan.id.toString(),
      roomId: loan.roomId,
      instructorId: loan.instructorId,
      guardaId: loan.guardaId,
      numeroPc: loan.numeroPc,
      estado: toLoanStatus(loan.estado),
      createdAt: loan.createdAt.toISOString(),
      acceptedAt: loan.acceptedAt?.toISOString() ?? null,
      equipmentIds: loan.loanItems.map((item) => item.equipmentId),
      returnedAt:
        loan.loanItems.length > 0 && returnedDates.length === loan.loanItems.length
          ? new Date(Math.max(...returnedDates)).toISOString()
          : null
    };
  }
}
