import { Credentials } from '@shared/dto/Credentials';

export interface ICredentialsStoreService {
  get(id: string): Promise<Credentials | undefined>;
  save(data: Credentials): Promise<Credentials>;
  delete(id: string): Promise<void>;
}
