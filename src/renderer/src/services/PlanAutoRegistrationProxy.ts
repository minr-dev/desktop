import { injectable } from 'inversify';
import {
  IPlanAutoRegistrationProxy,
  PlanAutoRegistrationParams,
} from './IPlanAutoRegistrationProxy';
import { handleIpcOperation } from './ipcErrorHandling';
import { IpcChannel } from '@shared/constants';
import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

@injectable()
export class PlanAutoRegistrationProxy implements IPlanAutoRegistrationProxy {
  async autoRegisterProvisonal({
    targetDate,
    projectId,
    taskExtraHours = new Map<string, number>(),
  }: PlanAutoRegistrationParams): Promise<PlanAutoRegistrationResult> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.AUTO_REGISTER_PROVISIONAL_PLANS,
        targetDate,
        taskExtraHours,
        projectId
      );
    });
  }
  async confirmRegistration(targetDate: Date): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.CONFIRM_PLAN_REGISTRATION,
        targetDate
      );
    });
  }
  async deleteProvisional(targetDate: Date): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.DELETE_PROVISONAL_PLANS,
        targetDate
      );
    });
  }
}
