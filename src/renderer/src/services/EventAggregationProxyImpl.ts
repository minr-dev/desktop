import { injectable } from 'inversify';
import { EventAggregationParams, IEventAggregationProxy } from './IEventAggregationProxy';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { IpcChannel } from '@shared/constants';

@injectable()
export class EventAggregationProxyImpl implements IEventAggregationProxy {
  async getAggregationByProject(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_PROJECT,
      start,
      end,
      eventType
    );
    return data;
  }
  async getAggregationByCategory(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_CATEGORY,
      start,
      end,
      eventType
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
  async getAggregationByLabel(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_AGGREGATION_LABEL,
      start,
      end,
      eventType
    );
    return data;
  }
}
