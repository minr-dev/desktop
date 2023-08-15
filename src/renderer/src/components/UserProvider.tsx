import rendererContainer from '../inversify.config';
import { ReactNode, useEffect, useState } from 'react';
import UserContext from './UserContext';
import { UserDetails } from '@shared/dto/UserDetails';
import { TYPES } from '@renderer/types';
import { IUserDetailsProxy } from '@renderer/services/IUserDetailsProxy';

export const UserProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  // 起動時にユーザー情報を取得
  useEffect(() => {
    const checkUserDetails = async (): Promise<void> => {
      const userDetailsProxy = rendererContainer.get<IUserDetailsProxy>(TYPES.UserDetailsProxy);
      const data = await userDetailsProxy.get();
      setUserDetails(data);
    };

    checkUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ userDetails: userDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};
