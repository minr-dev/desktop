import { IpcErrorResponse } from '@shared/data/IpcErrorResponse';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { ILogger } from '@main/services/ILogger';
import { getLogger } from '@main/utils/LoggerUtil';

let logger: ILogger;

/**
 * @template T
 * @function handleDatabaseOperation
 * @description データベース操作を行い、エラーが発生した場合はIpcErrorResponseを返す。
 * @param {() => Promise<T>} callback 実行するデータベース操作。
 * @returns {Promise<T | IpcErrorResponse>} 操作が成功した場合はその結果、失敗した場合はIpcErrorResponse。
 */
export const handleDatabaseOperation = async <T>(
  callback: () => Promise<T>
): Promise<T | IpcErrorResponse> => {
  logger = getLogger('dbHandlerUtil');
  try {
    const response = await callback();
    return response;
  } catch (error) {
    logger.error('handleDatabaseOperation error', error);
    const errName = AppError.getErrorName(error);
    if (errName === UniqueConstraintError.NAME) {
      return {
        error: true,
        errorCode: UniqueConstraintError.NAME,
        errorMessage: (error as UniqueConstraintError).message,
      };
    }
    if (error instanceof Error) {
      return {
        error: true,
        errorCode: AppError.NAME,
        errorMessage: error.message || 'An unknown error occurred',
      };
    }
    return {
      error: true,
      errorCode: 'UnknownError',
      errorMessage: 'An unknown error occurred',
    };
  }
};
