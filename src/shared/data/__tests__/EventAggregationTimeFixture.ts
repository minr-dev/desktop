import { EventAggregationTime } from '../EventAggregationTime';

export class EventAggregationTimeFixture {
  static default(override: Partial<EventAggregationTime> = {}): EventAggregationTime {
    return {
      name: 'test',
      aggregationTime: 0,
      ...override,
    };
  }
}
