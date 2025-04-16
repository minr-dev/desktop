import rendererContainer from './inversify.config';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import React, { useContext, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Route, Routes, HashRouter } from 'react-router-dom';
import { Box, PaletteMode, Toolbar } from '@mui/material';
import { TimelinePage } from './pages/TimelinePage';
import DrawerAppBar from './components/DrawerAppBar';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { ISpeakEventService } from './services/ISpeakEventService';
import { TYPES } from './types';
import { useUserPreference } from './hooks/useUserPreference';
import AppContext from './components/AppContext';
import { IpcChannel } from '@shared/constants';
import * as menu from './components/menu';
import { SettingPage } from './pages/SettingPage';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WorkAnalysisPage } from './pages/WorkAnalysisPage';
import { PomodoroTimerPage } from './pages/PomodoroTimerPage';
import { PomodoroTimerContextProvider } from './components/PomodoroTimerContextProvider';
import { IDesktopNotificationService } from './services/IDesktopNotificationService';
import { PlanAndActualCsvOutputPage } from './pages/PlanAndActualCsvOutputPage';
import { getLogger } from './utils/LoggerUtil';
import { useGitHubProjectV2Sync } from './hooks/useGitHubProjectV2Sync';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: 60 * 60 * 1000,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const logger = getLogger('App');

const App = (): JSX.Element => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { userPreference, loading } = useUserPreference();
  const { syncGitHubProjectV2, syncOrganization } = useGitHubProjectV2Sync();
  const { themeMode, setThemeMode } = useContext(AppContext);

  useEffect(() => {
    if (logger.isDebugEnabled())
      logger.debug('App.tsx: useEffect', userPreference, loading, prefersDarkMode);
    if (!loading && userPreference) {
      setThemeMode((userPreference.theme as PaletteMode) || (prefersDarkMode ? 'dark' : 'light'));
    }
  }, [loading, userPreference, setThemeMode, prefersDarkMode]);

  useEffect(() => {
    if (logger.isDebugEnabled()) logger.debug('useEffect', userPreference, loading);
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
    if (logger.isDebugEnabled()) logger.debug('register speak handler');
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.SPEAK_TEXT_NOTIFY, subscriber);
    return () => {
      // コンポーネントがアンマウントされたときに解除
      if (logger.isDebugEnabled()) logger.debug('unregister speak handler');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const desktopNotificationService = rendererContainer.get<IDesktopNotificationService>(
      TYPES.DesktopNotificationSubscriber
    );
    // ハンドラ
    const subscriber = (_event, text: string): void => {
      desktopNotificationService.sendDesktopNotification(text, 10 * 60 * 1000);
    };
    // コンポーネントがマウントされたときに IPC のハンドラを設定
    if (logger.isDebugEnabled()) logger.debug('register desktopNotification handler');
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannel.SEND_DESKTOP_NOTIFY, subscriber);
    return () => {
      // コンポーネントがアンマウントされたときに解除
      if (logger.isDebugEnabled()) logger.debug('unregister desktopNotification handler');
      unsubscribe();
    };
  }, []);

  // GitHubProjectV2 の同期を行う
  useEffect(() => {
    // memo: GitHubの組織を基に更新を行うので、組織の同期も実行する。
    syncOrganization();
    syncGitHubProjectV2();
  }, [syncGitHubProjectV2, syncOrganization]);

  if (theme === null) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={ja}
        dateFormats={{ monthAndYear: 'yyyy年MM月' }}
      >
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <PomodoroTimerContextProvider>
                <Box sx={{ display: 'flex' }}>
                  <DrawerAppBar />
                  <Box component="main" sx={{ width: '100%' }}>
                    <Toolbar />
                    <Routes>
                      <Route path={menu.MENU_TIMELINE.path} element={<TimelinePage />} />
                      <Route path={menu.MENU_SETTING.path} element={<SettingPage />} />
                      <Route path={menu.MENU_WORK_ANALYSIS.path} element={<WorkAnalysisPage />} />
                      <Route path={menu.MENU_POMODORO_TIMER.path} element={<PomodoroTimerPage />} />
                      <Route
                        path={menu.MENU_PLAN_AND_ACTUAL_CSV.path}
                        element={<PlanAndActualCsvOutputPage />}
                      />
                    </Routes>
                  </Box>
                </Box>
              </PomodoroTimerContextProvider>
            </SnackbarProvider>
          </HashRouter>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default App;
