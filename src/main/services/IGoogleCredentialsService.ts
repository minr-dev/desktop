import { GoogleCredentials } from '@shared/dto/GoogleCredentials';

export interface IGoogleCredentialsService {
  get(): Promise<GoogleCredentials | undefined>;
  save(data: GoogleCredentials): Promise<void>;
}
