import { ReactNode, useEffect, useState } from 'react';
import { KeyState, KeyStateContext } from './KeyStateContext';

export const KeyStateContextProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [keyState, setKeyState] = useState<KeyState>({ isCtrlPressed: false });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      setKeyState((prevState) => {
        if (event.ctrlKey && !prevState.isCtrlPressed) {
          return { isCtrlPressed: true };
        }
        return prevState;
      });
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      setKeyState((prevState) => {
        if (!event.ctrlKey && prevState.isCtrlPressed) {
          return { isCtrlPressed: false };
        }
        return prevState;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return <KeyStateContext.Provider value={keyState}>{children}</KeyStateContext.Provider>;
};
