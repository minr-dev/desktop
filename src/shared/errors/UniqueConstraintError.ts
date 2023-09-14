import { AppError } from './AppError';

/**
 * UniqueConstraintError
 * 一意性制約違反時にスローされるカスタムエラークラス。
 * このクラスは、データベースまたはアプリケーションのロジックで一意性が保証されていない場合に使用する。
 */
export class UniqueConstraintError extends AppError {
  static readonly NAME: string = 'UniqueConstraintError';

  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = UniqueConstraintError.NAME;
  }
}
