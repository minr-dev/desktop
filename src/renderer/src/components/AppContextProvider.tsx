import rendererContainer from '../inversify.config';
import { ReactNode, useEffect, useState } from 'react';
import AppContext from './AppContext';
import { UserDetails } from '@shared/data/UserDetails';
import { TYPES } from '@renderer/types';
import { IUserDetailsProxy } from '@renderer/services/IUserDetailsProxy';
import { PaletteMode } from '@mui/material';
import { AppError } from '@shared/errors/AppError';

export const AppContextProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [themeMode, setThemeMode] = useState<PaletteMode>('light');
  const [formStack, setFormStack] = useState<string[]>([]);

  // 起動時にユーザー情報を取得
  useEffect(() => {
    const checkUserDetails = async (): Promise<void> => {
      const userDetailsProxy = rendererContainer.get<IUserDetailsProxy>(TYPES.UserDetailsProxy);
      const data = await userDetailsProxy.get();
      setUserDetails(data);
    };

    checkUserDetails();
  }, []);

  const pushForm = (formId: string): void => {
    setFormStack([...formStack, formId]);
  };
  const popForm = (): void => {
    setFormStack(formStack.slice(0, -1));
  };
  const getActiveForm = (): string => {
    if (formStack.length === 0) {
      throw new AppError('Form stack is empty');
    }
    return formStack[formStack.length - 1];
  };

  return (
    <AppContext.Provider
      value={{
        userDetails,
        setUserDetails,
        themeMode,
        setThemeMode,
        pushForm,
        popForm,
        getActiveForm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
