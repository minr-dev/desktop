/**
 * AppError
 * アプリ共通の基底エラークラス。
 */
export class AppError extends Error {
  static readonly NAME: string = 'AppError';

  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = AppError.NAME;
    this.cause = cause;
    // プロトタイプ継承（この行は継承されたクラスでスタックトレースが正確に機能するために必要）
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static getErrorName = (error: unknown): string | null => {
    if (error instanceof Error && 'name' in error) {
      return error['name'] as string;
    }
    return null;
  };
}
