import { EventTimeCell } from './EventTimeCell';

export interface IOverlapEventService {
  execute(eventEntries: ReadonlyArray<EventTimeCell>): EventTimeCell[];
}
