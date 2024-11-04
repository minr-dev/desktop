import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export interface EventEntryCsv {
  eventEntryId: string;
  eventType: string;
  start: string;
  end: string;
  summary: string;
  projectId: string;
  projectName: string;
  categoryId: string;
  categoryName: string;
  taskId: string;
  taskName: string;
  labelIds: string;
  labelNames: string;
  description: string;
}

export interface IEventEnryCsvSearchService {
  searchEventEntryCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<EventEntryCsv[]>;
}
