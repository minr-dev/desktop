export interface ITaskProcessor {
  execute(): Promise<void>;
  terminate(): Promise<void>;
}
