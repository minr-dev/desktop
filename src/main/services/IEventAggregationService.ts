export interface IEventAggregationService {
  getPlannedTimeByTasks(userId: string, taskIds: string[]): Promise<Map<string, number>>;
}
