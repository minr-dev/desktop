import path from 'path';

// テスト実行時にelectronのライブラリを使用すると認識されずエラーになってしまうため、モック化する。
// * electronのメソッドを新たにモック化する場合はappに追加する。
export const app = {
  getPath: jest.fn().mockReturnValue(path.join(process.cwd(), '.test')),
};
