import { UserDetails } from '@shared/data/UserDetails';

export interface IUserDetailsProxy {
  get(): Promise<UserDetails>;
}
