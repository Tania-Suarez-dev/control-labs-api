import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummaryDTO>;
}