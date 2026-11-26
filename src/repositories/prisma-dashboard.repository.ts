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
      novedadesCriticasSinResolver
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
      })
    ]);

    return {
      totalUsuarios,
      ambientesActivos,
      equiposOperativos,
      novedadesCriticasSinResolver
    };
  }
}