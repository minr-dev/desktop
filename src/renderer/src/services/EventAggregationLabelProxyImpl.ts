import { injectable } from 'inversify';
import { IEventAggregationLabelProxy } from './IEventAggregationLabelProxy';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { IpcChannel } from '@shared/constants';

@injectable()
export class EventAggregationLabelProxyImpl implements IEventAggregationLabelProxy {
  async get(start: Date, end: Date, eventType: EVENT_TYPE): Promise<EventAggregationTime[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ANALYSIS_AGGREGATION_LABEL,
      start,
      end,
      eventType
    );
    return data;
  }
}
