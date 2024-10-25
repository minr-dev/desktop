import { Label } from '../Label';

export class LabelFixture {
  static default(override: Partial<Label> = {}): Label {
    return {
      id: '1',
      name: 'test-label',
      description: 'ラベルテスト',
      color: '#888888',
      updated: new Date('2024-10-24T10:00:00+0900'),
      ...override,
    };
  }
}
