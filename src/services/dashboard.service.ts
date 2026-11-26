import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';
import { DashboardRepository } from '../repositories/dashboard.repository';

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  public getSummary(): Promise<DashboardSummaryDTO> {
    return this.dashboardRepository.getSummary();
  }
}
