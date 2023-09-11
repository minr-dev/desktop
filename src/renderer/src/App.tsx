import rendererContainer from './inversify.config';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import React, { useContext, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Route, Routes, HashRouter } from 'react-router-dom';
import { Box, PaletteMode, Toolbar } from '@mui/material';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import PreferencePage from './pages/PreferencePage';
import DrawerAppBar from './components/DrawerAppBar';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { ISpeakEventService } from './services/ISpeakEventService';
import { TYPES } from './types';
import { useUserPreference } from './hooks/useUserPreference';
import UserContext from './components/UserContext';
import { IpcChannel } from '@shared/constants';

const App = (): JSX.Element => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { userPreference, loading } = useUserPreference();
  const { themeMode, setThemeMode } = useContext(UserContext);

  useEffect(() => {
    console.log('App.tsx: useEffect', userPreference, loading, prefersDarkMode);
    if (!loading && userPreference) {
      setThemeMode((userPreference.theme as PaletteMode) || (prefersDarkMode ? 'dark' : 'light'));
    }
  }, [loading, userPreference, setThemeMode, prefersDarkMode]);

  useEffect(() => {
    console.log('useEffect', userPreference, loading);
  }, [loading, userPreference]);

  const theme = React.useMemo(() => {
    if (themeMode === null) {
      return null;
    }
    return createTheme({
      palette: {
        mode: themeMode,
      },
      typography: {
        fontFamily: ['Noto Sans JP', 'Yu Gothic', 'Roboto', 'sans-serif'].join(','),
        fontSize: 14,
      },
    });
  }, [themeMode]);

  useEffect(() => {
    if (theme === null) {
      return;
    }
    const bodyBackground =
      theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50];
    const textColor =
      theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.grey[900];

    document.body.style.backgroundColor = bodyBackground;
    document.body.style.color = textColor;
  }, [theme]);

  useEffect(() => {
    const speakEventService = rendererContainer.get<ISpeakEventService>(TYPES.SpeakEventSubscriber);
    // ハンドラ
    const subscriber = (_event, text: string): void => {
      speakEventService.speak(text);
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    console.log('register speak handler');
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.SPEAK_TEXT_NOTIFY, subscriber);
    return () => {
      // コンポーネントがアンマウントされたときに解除
      console.log('unregister speak handler');
      unsubscribe();
    };
  }, []);

  if (theme === null) {
    return <div>Loading...</div>;
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={ja}
      dateFormats={{ monthAndYear: 'yyyy年MM月' }}
    >
      <ThemeProvider theme={theme}>
        <HashRouter>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Box sx={{ display: 'flex' }}>
              <DrawerAppBar />
              <Box component="main" sx={{ width: '100%' }}>
                <Toolbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/preference" element={<PreferencePage />} />
                  <Route path="/account" element={<AccountPage />} />
                </Routes>
              </Box>
            </Box>
          </SnackbarProvider>
        </HashRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
