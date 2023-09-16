import { ActivityColor } from '../ActivityColor';

export class ActivityColorFixture {
  static default(override: Partial<ActivityColor> = {}): ActivityColor {
    return {
      id: '1',
      appPath: 'c:\\program files\\test\\test.exe',
      appColor: '#888888',
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
