import { PrismaClient } from '@prisma/client';
import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';
import { DashboardRepository } from './dashboard.repository';

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly database: PrismaClient) {}

  public async getSummary(allowedRoomIds?: string[]): Promise<DashboardSummaryDTO> {
    const rooms = allowedRoomIds ?? [];
    const unresolvedCriticalStatuses = ['PENDIENTE', 'EN_PROCESO'];

    const [
      totalUsuarios,
      ambientesActivos,
      equiposOperativos,
      equiposPrestados,
      novedadesCriticasSinResolver
    ] = await Promise.all([
      allowedRoomIds
        ? this.database.user.count({
            where: {
              userRooms: {
                some: { roomId: { in: rooms } }
              }
            }
          })
        : this.database.user.count(),

      allowedRoomIds
        ? this.database.room.count({
            where: { id: { in: rooms }, estado: 'OPERATIVO' }
          })
        : this.database.room.count({
            where: { estado: 'OPERATIVO' }
          }),

      allowedRoomIds
        ? this.database.equipment.count({
            where: { roomId: { in: rooms }, estado: 'OPERATIVO' }
          })
        : this.database.equipment.count({
            where: { estado: 'OPERATIVO' }
          }),

      allowedRoomIds
        ? this.database.loanEquipment.count({
            where: {
              returnedAt: null,
              loan: {
                estado: 'APROBADO_Y_FIRMADO',
                returnedAt: null,
                roomId: { in: rooms }
              }
            }
          })
        : this.database.loanEquipment.count({
            where: {
              returnedAt: null,
              loan: {
                estado: 'APROBADO_Y_FIRMADO',
                returnedAt: null
              }
            }
          }),

      allowedRoomIds
        ? this.database.incident.count({
            where: {
              equipment: { roomId: { in: rooms } },
              prioridad: 'ALTA',
              estado: { in: unresolvedCriticalStatuses }
            }
          })
        : this.database.incident.count({
            where: {
              prioridad: 'ALTA',
              estado: { in: unresolvedCriticalStatuses }
            }
          })
    ]);

    return {
      totalUsuarios,
      ambientesActivos,
      equiposOperativos,
      equiposPrestados,
      novedadesCriticasSinResolver
    };
  }
}
