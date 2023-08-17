import { UserDetails } from '@shared/dto/UserDetails';
import React from 'react';

type UserContextType = {
  userDetails: UserDetails | null;
  setUserDetails: (user: UserDetails | null) => void;
};

const UserContext = React.createContext<UserContextType>({
  userDetails: null,
  setUserDetails: () => {},
});

export default UserContext;
