import { EventAggregationTime } from '../EventAggregationTime';

export class EventAggregationTimeFixture {
  static default(override: Partial<EventAggregationTime> = {}): EventAggregationTime {
    return {
      dataKey: 'test',
      usageTime: 0,
      ...override,
    };
  }
}
