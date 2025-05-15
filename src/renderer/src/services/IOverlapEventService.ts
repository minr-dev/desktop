import { EventTimeCell } from '../components/timeTable/EventTimeCell';

export interface IOverlapEventService {
  execute<T extends EventTimeCell>(eventEntries: ReadonlyArray<T>): T[];
}
