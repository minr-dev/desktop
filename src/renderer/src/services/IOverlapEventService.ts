import { EventTimeCell } from './EventTimeCell';

export interface IOverlapEventService {
  execute<TEvent, TEventTimeCell extends EventTimeCell<TEvent, TEventTimeCell>>(
    eventEntries: ReadonlyArray<TEventTimeCell>
  ): TEventTimeCell[];
}
