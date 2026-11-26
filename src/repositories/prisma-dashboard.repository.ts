import { PrismaClient } from '@prisma/client';
import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';
import { DashboardRepository } from './dashboard.repository';

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly database: PrismaClient) {}

  public async getSummary(): Promise<DashboardSummaryDTO> {
    const [
      totalUsuarios,
      ambientesActivos,
      equiposOperativos,
      novedadesCriticasSinResolver,
      prestamosPendientes,
      prestamosActivos,
      equiposPrestados,
      novedadesResueltas,
      comentariosNovedades
    ] = await Promise.all([
      this.database.user.count(),
      this.database.room.count({
        where: { estado: 'OPERATIVO' }
      }),
      this.database.equipment.count({
        where: { estado: 'OPERATIVO' }
      }),
      this.database.incident.count({
        where: {
          prioridad: 'ALTA',
          estado: { in: ['PENDIENTE', 'EN_PROCESO'] }
        }
      }),
      this.database.loan.count({
        where: { estado: 'PENDIENTE_APROBACION' }
      }),
      this.database.loan.count({
        where: {
          estado: 'APROBADO_Y_FIRMADO',
          loanItems: { some: { returnedAt: null } }
        }
      }),
      this.database.loanEquipment.count({
        where: { returnedAt: null }
      }),
      this.database.incident.count({
        where: { estado: 'RESUELTA' }
      }),
      this.database.incidentComment.count()
    ]);

    return {
      totalUsuarios,
      ambientesActivos,
      equiposOperativos,
      novedadesCriticasSinResolver,
      prestamosPendientes,
      prestamosActivos,
      equiposPrestados,
      novedadesResueltas,
      comentariosNovedades
    };
  }
}
