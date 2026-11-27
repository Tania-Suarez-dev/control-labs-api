import { Loan as PrismaLoan, PrismaClient } from '@prisma/client';
import { ICreateLoanDTO } from '../dtos/loan.dto';
import { DomainError } from '../errors/domain.error';
import {
  EquipmentLoanRef,
  Loan,
  LoanFilters,
  LoanRepository,
  LoanStatus,
  RoomRef
} from './loan.repository';

type LoanWithItems = PrismaLoan & {
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

  if (code === 'P2002') {
    throw new DomainError(
      'CONFLICT',
      'Ya existe un préstamo activo con alguno de los equipos indicados.'
    );
  }

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

  public async create(input: ICreateLoanDTO): Promise<Loan> {
    try {
      const loan = await this.database.loan.create({
        data: {
          roomId: input.roomId,
          instructorId: input.instructorId,
          guardaId: input.guardaId,
          numeroPc: input.numeroPc,
          loanItems: {
            create: input.equipmentIds.map((equipmentId) => ({ equipmentId }))
          }
        },
        include: { loanItems: true }
      });

      return this.toDomain(loan);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async findAll(filters: LoanFilters = {}): Promise<Loan[]> {
    const loans = await this.database.loan.findMany({
      where: {
        ...(filters.roomId ? { roomId: filters.roomId } : {}),
        ...(filters.instructorId ? { instructorId: filters.instructorId } : {}),
        ...(filters.guardaId ? { guardaId: filters.guardaId } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: { loanItems: true }
    });

    return loans.map((loan) => this.toDomain(loan));
  }

  public async findById(id: string): Promise<Loan | null> {
    const loan = await this.database.loan.findUnique({
      where: { id: BigInt(id) },
      include: { loanItems: true }
    });

    return loan ? this.toDomain(loan) : null;
  }

  public async findRoomById(id: string): Promise<RoomRef | null> {
    const room = await this.database.room.findUnique({
      where: { id },
      select: { id: true, estado: true }
    });

    return room ? { id: room.id, estado: room.estado } : null;
  }

  public async findEquipmentReferences(
    equipmentIds: string[]
  ): Promise<EquipmentLoanRef[]> {
    const items = await this.database.equipment.findMany({
      where: { id: { in: equipmentIds } },
      select: { id: true, roomId: true, estado: true }
    });

    return items.map((item) => ({
      id: item.id,
      roomId: item.roomId,
      estado: item.estado
    }));
  }

  public async findActiveEquipmentIds(
    equipmentIds: string[]
  ): Promise<string[]> {
    const items = await this.database.loanEquipment.findMany({
      where: {
        equipmentId: { in: equipmentIds },
        returnedAt: null,
        loan: {
          returnedAt: null,
          estado: { in: ['PENDIENTE_APROBACION', 'APROBADO_Y_FIRMADO'] }
        }
      },
      select: { equipmentId: true }
    });

    return [...new Set(items.map((item) => item.equipmentId))];
  }

  public async isActiveInstructor(id: string): Promise<boolean> {
    const instructor = await this.database.user.findFirst({
      where: { id, rol: 'INSTRUCTOR', activo: true },
      select: { id: true }
    });

    return instructor !== null;
  }

  public async acceptLoan(
    id: string,
    guardaId: string,
    allowedRoomIds?: string[]
  ): Promise<Loan | null> {
    const loan = await this.findById(id);
    if (!loan) {
      return null;
    }

    if (allowedRoomIds && !allowedRoomIds.includes(loan.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre la sala del préstamo.');
    }

    if (loan.estado !== 'PENDIENTE_APROBACION') {
      return null;
    }

    try {
      const result = await this.database.loan.updateMany({
        where: {
          id: BigInt(id),
          estado: 'PENDIENTE_APROBACION',
          returnedAt: null,
          ...(allowedRoomIds ? { roomId: { in: allowedRoomIds } } : {})
        },
        data: {
          estado: 'APROBADO_Y_FIRMADO',
          acceptedAt: new Date(),
          acceptedByGuardId: guardaId
        }
      });

      return result.count === 0 ? null : this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  public async returnLoan(
    id: string,
    allowedRoomIds?: string[]
  ): Promise<Loan | null> {
    const loan = await this.findById(id);
    if (!loan) {
      return null;
    }

    if (allowedRoomIds && !allowedRoomIds.includes(loan.roomId)) {
      throw new DomainError('FORBIDDEN', 'No tiene permiso sobre la sala del préstamo.');
    }

    if (loan.estado !== 'APROBADO_Y_FIRMADO' || loan.returnedAt !== null) {
      return null;
    }

    const now = new Date();

    try {
      await this.database.$transaction([
        this.database.loanEquipment.updateMany({
          where: { loanId: BigInt(id), returnedAt: null },
          data: { returnedAt: now }
        }),
        this.database.loan.updateMany({
          where: { id: BigInt(id), returnedAt: null },
          data: { returnedAt: now }
        })
      ]);

      return this.findById(id);
    } catch (error) {
      translatePersistenceError(error);
      throw error;
    }
  }

  private toDomain(loan: LoanWithItems): Loan {
    return {
      id: loan.id.toString(),
      roomId: loan.roomId,
      instructorId: loan.instructorId,
      guardaId: loan.guardaId,
      numeroPc: loan.numeroPc,
      equipmentIds: loan.loanItems.map((item) => item.equipmentId),
      estado: toLoanStatus(loan.estado),
      createdAt: loan.createdAt.toISOString(),
      acceptedAt: loan.acceptedAt?.toISOString() ?? null,
      acceptedByGuardId: loan.acceptedByGuardId ?? null,
      returnedAt: loan.returnedAt?.toISOString() ?? null
    };
  }
}
