import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { handleDatabaseOperation } from './dbHandlerUtil';
import type { IBusinessClassificationUsageService } from '@main/services/IBusinessClassificationUsageService';
import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';

@injectable()
export class BusinessClassificationUsageServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.BusinessClassificationUsageService)
    private readonly BusinessClassificationUsageService: IBusinessClassificationUsageService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.BUSINESS_CLASSIFICATION_USAGE_LIST,
      async (_event, start, end, eventType) => {
        return handleDatabaseOperation(async (): Promise<BusinessClassificationUsage[]> => {
          return await this.BusinessClassificationUsageService.get(start, end, eventType);
        });
      }
    );
  }
}
