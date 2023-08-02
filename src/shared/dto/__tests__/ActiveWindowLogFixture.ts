import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';

export class ActiveWindowLogFixture {
  static default(override: Partial<ActiveWindowLog> = {}): ActiveWindowLog {
    return {
      id: '1',
      basename: 'Test.exe',
      pid: '1234',
      windowTitle: 'Test Title',
      path: 'C:\\Program Files\\Test\\Test.exe',
      activated: new Date('2023-07-01T10:00:00+0900'),
      deactivated: new Date('2023-07-01T10:30:00+0900'),
      ...override,
    };
  }
}
