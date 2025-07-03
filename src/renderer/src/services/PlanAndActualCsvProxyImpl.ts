import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { IPlanAndActualCsvProxy } from './IPlanAndActualCsvProxy';

@injectable()
export class PlanAndActualCsvProxyImpl implements IPlanAndActualCsvProxy {
  async createCsv(planAndActualCsvSetting: PlanAndActualCsvSetting): Promise<string> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.PLAN_AND_ACTUAL_CSV_CREATE,
      planAndActualCsvSetting
    );
  }
}
