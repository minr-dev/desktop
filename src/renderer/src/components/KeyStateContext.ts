import { createContext } from 'react';

export type KeyState = {
  isCtrlPressed: boolean;
};

export const KeyStateContext = createContext<KeyState>({ isCtrlPressed: false });
