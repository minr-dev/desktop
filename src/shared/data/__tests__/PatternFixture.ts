import { Pattern } from '../Pattern';

export class PatternFixture {
  static default(override: Partial<Pattern> = {}): Pattern {
    return {
      id: '1',
      name: 'pattern1',
      basename: 'test.exe',
      regularExpression: '.*',
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
