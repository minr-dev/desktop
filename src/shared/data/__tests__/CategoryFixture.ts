import { Category } from "../Category";

export class CategoryFixture {
  static default(override: Partial<Category> = {}): Category {
    return {
      id: '1',
      name: 'test-category',
      description: 'カテゴリテスト',
      color: '#888888',
      updated: new Date('2024-10-24T10:00:00+0900'),
      ...override,
    }
  }
}
