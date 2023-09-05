import { PaletteMode } from '@mui/material';
import { UserDetails } from '@shared/dto/UserDetails';
import React from 'react';

type UserContextType = {
  userDetails: UserDetails | null;
  setUserDetails: (user: UserDetails | null) => void;

  themeMode: PaletteMode | null;
  setThemeMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
};

const UserContext = React.createContext<UserContextType>({
  userDetails: null,
  setUserDetails: () => {},

  themeMode: null,
  setThemeMode: () => {},
});

export default UserContext;
