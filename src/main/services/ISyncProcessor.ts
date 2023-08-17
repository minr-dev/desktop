export interface ISyncProcessor {
  sync(): Promise<void>;
}
