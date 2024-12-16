import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IPlanPatternService } from '@main/services/IPlanPatternService';
import { TYPES } from '@main/types';
import { Pageable, PageResponse } from '@shared/data/Page';
import { PlanPattern } from '@shared/data/PlanPattern';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';

/**
 * PlanPattern のデータの取得用の IPC ハンドラー
 */
@injectable()
export class PlanPatternHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanPatternService)
    private readonly planPatternService: IPlanPatternService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.PLAN_PATTERN_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<PlanPattern>> => {
        const page = await this.planPatternService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.PLAN_PATTERN_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<PlanPattern | null> => {
        return await this.planPatternService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.PLAN_PATTERN_SAVE, async (_event, pattern) => {
      return handleDatabaseOperation(async (): Promise<PlanPattern> => {
        return await this.planPatternService.save(pattern);
      });
    });

    ipcMain.handle(IpcChannel.PLAN_PATTERN_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planPatternService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.PLAN_PATTERN_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planPatternService.bulkDelete(ids);
      });
    });
  }
}
