import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { IPlanTemplateApplyProxy } from './IPlanTemplateApplyProxy';

@injectable()
export class PlanTemplateApplyProxyImpl implements IPlanTemplateApplyProxy {
  async applyTemplate(targetDate: Date, templateId: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.APPLY_PLAN_TEMPLATE,
        targetDate,
        templateId
      );
    });
  }
}
