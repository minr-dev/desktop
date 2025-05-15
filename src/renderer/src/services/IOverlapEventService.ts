import { EventTimeCell } from './EventTimeCell';

export interface IOverlapEventService {
  execute<T extends EventTimeCell>(eventEntries: ReadonlyArray<T>): T[];
}
