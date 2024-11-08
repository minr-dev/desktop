import { injectable } from 'inversify';
import { IActualAutoRegistrationProxy } from './IActualAutoRegistrationProxy';
import { handleIpcOperation } from './ipcErrorHandling';
import { IpcChannel } from '@shared/constants';
import { EventEntry } from '@shared/data/EventEntry';

@injectable()
export class ActualAutoRegistrationProxy implements IActualAutoRegistrationProxy {
  async autoRegisterProvisonalActuals(targetDate: Date): Promise<EventEntry[]> {
    console.log('autoRegister');
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.AUTO_REGISTER_PROVISIONAL_ACTUALS,
        targetDate
      );
    });
  }
  async confirmActualRegistration(targetDate: Date): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.CONFIRM_ACTUAL_REGISTRATION,
        targetDate
      );
    });
  }
  async deleteProvisionalActuals(targetDate: Date): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.DELETE_PROVISONAL_ACTUALS,
        targetDate
      );
    });
  }
}
