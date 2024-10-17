import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IPatternService } from '@main/services/IPatternService';
import { PageResponse, Pageable } from '@shared/data/Page';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { Pattern } from '@shared/data/Pattern';

/**
 * Pattern のデータの取得用の IPC ハンドラー
 */
@injectable()
export class PatternHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PatternService)
    private readonly patternService: IPatternService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.PATTERN_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Pattern>> => {
        const page = await this.patternService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.PATTERN_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Pattern | null> => {
        return await this.patternService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.PATTERN_SAVE, async (_event, pattern) => {
      return handleDatabaseOperation(async (): Promise<Pattern> => {
        return await this.patternService.save(pattern);
      });
    });

    ipcMain.handle(IpcChannel.PATTERN_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.patternService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.PATTERN_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.patternService.bulkDelete(ids);
      });
    });
  }
}
