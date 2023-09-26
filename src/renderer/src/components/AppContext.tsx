import { PaletteMode } from '@mui/material';
import { UserDetails } from '@shared/data/UserDetails';
import React from 'react';

type AppContextType = {
  userDetails: UserDetails | null;
  setUserDetails: (user: UserDetails | null) => void;

  themeMode: PaletteMode | null;
  setThemeMode: React.Dispatch<React.SetStateAction<PaletteMode>>;

  pushForm: (formId: string) => void;
  popForm: () => void;
  getActiveForm: () => string;
};

const AppContext = React.createContext<AppContextType>({
  userDetails: null,
  setUserDetails: () => {},

  themeMode: null,
  setThemeMode: () => {},

  pushForm: () => {},
  popForm: () => {},
  getActiveForm: () => '',
});

export default AppContext;
