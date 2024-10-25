import { Project } from '../Project';

export class ProjectFixture {
  static default(override: Partial<Project> = {}): Project {
    return {
      id: '1',
      name: 'test-project',
      description: 'プロジェクトテスト',
      updated: new Date('2024-10-24T10:00:00+0900'),
      ...override,
    };
  }
}
