import { Credentials } from '@shared/dto/Credentials';

export interface ICredentialsStoreService {
  get(): Promise<Credentials | undefined>;
  save(data: Credentials): Promise<void>;
  delete(): Promise<void>;
}
