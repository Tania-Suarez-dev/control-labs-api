import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';
import { DashboardRepository } from './dashboard.repository';

export class InMemoryDashboardRepository implements DashboardRepository {
  public async getSummary(): Promise<DashboardSummaryDTO> {
    return {
      totalUsuarios: 4,
      ambientesActivos: 210,
      equiposOperativos: 26041,
      novedadesCriticasSinResolver: 2
    };
  }
}