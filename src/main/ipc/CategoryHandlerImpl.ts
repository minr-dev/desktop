import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { ICategoryService } from '@main/services/ICategoryService';
import { Pageable } from '@shared/data/Page';

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
      const page = await this.categoryService.list(Pageable.fromPageRequest(pageRequest));
      return page.toPageResponse();
    });
  }
}
