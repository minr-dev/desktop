import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IProjectService } from '@main/services/IProjectService';
import { PageResponse, Pageable } from '@shared/data/Page';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { Project } from '@shared/data/Project';

/**
 * Projectのデータの取得用の IPC ハンドラー
 */
@injectable()
export class ProjectHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ProjectService)
    private readonly projectService: IProjectService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.PROJECT_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Project>> => {
        const page = await this.projectService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.PROJECT_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Project> => {
        return await this.projectService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.PROJECT_SAVE, async (_event, project) => {
      return handleDatabaseOperation(async (): Promise<Project> => {
        return await this.projectService.save(project);
      });
    });

    ipcMain.handle(IpcChannel.PROJECT_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.projectService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.PROJECT_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.projectService.bulkDelete(ids);
      });
    });
  }
}
