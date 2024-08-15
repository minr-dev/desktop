import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IApplicationService } from '@main/services/IApplicationService';
import { PageResponse, Pageable } from '@shared/data/Page';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { Application } from '@shared/data/Application';

/**
 * Applicationのデータの取得用の IPC ハンドラー
 */
@injectable()
export class ApplicationHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ApplicationService)
    private readonly applicationService: IApplicationService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.APPLICATION_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Application>> => {
        const page = await this.applicationService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.APPLICATION_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Application | null> => {
        return await this.applicationService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.APPLICATION_SAVE, async (_event, Application) => {
      return handleDatabaseOperation(async (): Promise<Application> => {
        return await this.applicationService.save(Application);
      });
    });

    ipcMain.handle(IpcChannel.APPLICATION_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.applicationService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.APPLICATION_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.applicationService.bulkDelete(ids);
      });
    });

    ipcMain.handle(IpcChannel.APPLICATION_GET_BY_NAME, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<Application | null> => {
        return await this.applicationService.getByName(ids);
      });
    });
  }
}
