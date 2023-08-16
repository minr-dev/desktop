export interface ICalendarSynchronizerProxy {
  sync(): Promise<void>;
}
