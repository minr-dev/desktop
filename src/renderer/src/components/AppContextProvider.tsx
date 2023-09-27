import rendererContainer from '../inversify.config';
import { ReactNode, useEffect, useState } from 'react';
import AppContext from './AppContext';
import { UserDetails } from '@shared/data/UserDetails';
import { TYPES } from '@renderer/types';
import { IUserDetailsProxy } from '@renderer/services/IUserDetailsProxy';
import { PaletteMode } from '@mui/material';

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

  const isLastForm = (formId: string): boolean => {
    if (formStack.length === 0) {
      return false;
    }
    return formStack[formStack.length - 1] === formId;
  };
  const pushForm = (formId: string): void => {
    if (formStack.length === 0) {
      return;
    }
    if (formStack.includes(formId)) {
      return;
    }
    setFormStack([...formStack, formId]);
    console.log('pushForm', formStack);
  };
  const removeForm = (formId: string): void => {
    console.log('removeForm', formStack);
    const index = formStack.indexOf(formId);
    if (index !== -1) {
      const newStack = [...formStack];
      newStack.splice(index, 1);
      setFormStack(newStack);
      console.log('removed', newStack);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userDetails,
        setUserDetails,
        themeMode,
        setThemeMode,
        pushForm,
        removeForm,
        isLastForm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
