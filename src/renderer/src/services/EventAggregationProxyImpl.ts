import { injectable } from 'inversify';
import { EventAggregationParams, IEventAggregationProxy } from './IEventAggregationProxy';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { IpcChannel } from '@shared/constants';

@injectable()
export class EventAggregationProxyImpl implements IEventAggregationProxy {
  async getAggregationByProject(params: EventAggregationParams): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_PROJECT,
      params
    );
    return data;
  }
  async getAggregationByCategory(params: EventAggregationParams): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_CATEGORY,
      params
    );
    return data;
  }
  async getAggregationByTask(params: EventAggregationParams): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_TASK,
      params
    );
    return data;
  }
  async getAggregationByLabel(params: EventAggregationParams): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_LABEL,
      params
    );
    return data;
  }
}
