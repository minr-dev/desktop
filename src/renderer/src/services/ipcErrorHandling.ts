import { IpcErrorResponse } from '@shared/data/IpcErrorResponse';
import { AppError } from '@shared/errors/AppError';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

/**
 * handleIpcOperation
 * IPC操作をラップし、エラーハンドリングを行います。
 * @param callback - 実行する非同期処理。
 * @returns 非同期処理の結果。
 * @throws AppError エラーが発生した場合、AppErrorまたはその派生クラスのエラーをスローします。
 */
export const handleIpcOperation = async <T>(callback: () => Promise<T>): Promise<T> => {
  const response = await callback();
  if (response && typeof response === 'object' && 'error' in response) {
    throwIfAppError(response as IpcErrorResponse);
  }
  return response;
};

/**
 * throwIfAppError
 * IPC 操作でエラーが発生した場合、対応するアプリケーション例外をスローする。
 * @param {IpcErrorResponse} response - IPCから受け取ったレスポンス。
 * @throws {AppError} - 対応するエラークラスのインスタンス。
 */
export const throwIfAppError = (response: IpcErrorResponse): void => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'throwIfAppError',
  });
  if (response.error) {
    switch (response.errorCode) {
      case UniqueConstraintError.NAME:
        logger.error(`${response.errorMessage}`);
        throw new UniqueConstraintError(response.errorMessage || '');
      default:
        logger.error(`${response.errorMessage}`);
        throw new AppError(response.errorMessage || `errorCode=${response.errorCode}`);
    }
  }
};
