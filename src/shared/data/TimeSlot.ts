import { Time } from './Time';

export interface TimeSlot<T extends Date | Time> {
  start: T;
  end: T;
}
