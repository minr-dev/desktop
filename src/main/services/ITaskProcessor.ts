export interface ITaskProcessor {
  execute(): Promise<void>;
}
