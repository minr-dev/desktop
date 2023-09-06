export interface ICredentialsStoreService<T> {
  get(id: string): Promise<T | undefined>;
  save(data: T): Promise<T>;
  delete(id: string): Promise<void>;
}
