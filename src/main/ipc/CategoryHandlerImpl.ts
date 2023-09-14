import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { ICategoryService } from '@main/services/ICategoryService';
import { PageResponse, Pageable } from '@shared/data/Page';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { Category } from '@shared/data/Category';

/**
 * Categoryのデータの取得用の IPC ハンドラー
 */
@injectable()
export class CategoryHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.CategoryService)
    private readonly categoryService: ICategoryService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.CATEGORY_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Category>> => {
        const page = await this.categoryService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.CATEGORY_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Category> => {
        return await this.categoryService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.CATEGORY_SAVE, async (_event, category) => {
      return handleDatabaseOperation(async (): Promise<Category> => {
        return await this.categoryService.save(category);
      });
    });

    ipcMain.handle(IpcChannel.CATEGORY_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.categoryService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.CATEGORY_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.categoryService.bulkDelete(ids);
      });
    });
  }
}
