import { EventEntry } from '@shared/dto/EventEntry';

export interface OverlappedEventEntry extends EventEntry {
  overlappingIndex: number;
  overlappingCount: number;
  startDateTime: Date;
  endDateTime: Date;
}

export interface IOverlapEventService {
  execute(eventEntries: ReadonlyArray<EventEntry>): ReadonlyArray<OverlappedEventEntry>;
}
