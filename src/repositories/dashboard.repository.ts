import { DashboardSummaryDTO } from '../dtos/dashboard.dtos';

export interface DashboardRepository {
  getSummary(allowedRoomIds?: string[]): Promise<DashboardSummaryDTO>;
}
