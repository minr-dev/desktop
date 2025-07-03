import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { ILabelService } from '@main/services/ILabelService';
import { PageResponse, Pageable } from '@shared/data/Page';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { Label } from '@shared/data/Label';

/**
 * Labelのデータの取得用の IPC ハンドラー
 */
@injectable()
export class LabelHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.LabelService)
    private readonly labelService: ILabelService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.LABEL_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Label>> => {
        const page = await this.labelService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.LABEL_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Label> => {
        return await this.labelService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.LABEL_SAVE, async (_event, label) => {
      return handleDatabaseOperation(async (): Promise<Label> => {
        return await this.labelService.save(label);
      });
    });

    ipcMain.handle(IpcChannel.LABEL_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.labelService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.LABEL_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.labelService.bulkDelete(ids);
      });
    });
  }
}
