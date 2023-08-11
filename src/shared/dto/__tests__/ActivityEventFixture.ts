import { ActivityDetail, ActivityEvent } from '../ActivityEvent';

export class ActivityEventFixture {
  static default(override: Partial<ActivityEvent> = {}): ActivityEvent {
    return {
      id: '1',
      basename: 'test.exe',
      start: new Date('2023-07-01T10:00:00+0900'),
      end: new Date('2023-07-01T10:30:00+0900'),
      details: [ActivityDetailFixture.default()],
      appColor: '#888888',
      ...override,
    };
  }
}

export class ActivityDetailFixture {
  static default(override: Partial<ActivityDetail> = {}): ActivityDetail {
    return {
      id: '1',
      windowTitle: 'title1',
      start: new Date('2023-07-01T10:00:00+0900'),
      end: new Date('2023-07-01T10:30:00+0900'),
      ...override,
    };
  }
}
