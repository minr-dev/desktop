import { Credentials } from '@shared/dto/Credentials';

export interface ICredentialsStoreService {
  get(): Promise<Credentials | undefined>;
  save(data: Credentials): Promise<Credentials>;
  delete(): Promise<void>;
}
