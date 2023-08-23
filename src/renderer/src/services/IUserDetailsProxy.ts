import { UserDetails } from '@shared/dto/UserDetails';

export interface IUserDetailsProxy {
  get(): Promise<UserDetails>;
}
