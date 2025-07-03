import { PlanPattern } from '../PlanPattern';

export class PlanPatternFixture {
  static default(override: Partial<PlanPattern> = {}): PlanPattern {
    return {
      id: '1',
      name: 'pattern',
      regularExpression: '.*',
      updated: new Date('2024-12-01T10:00:00+0900'),
      ...override,
    };
  }
}
