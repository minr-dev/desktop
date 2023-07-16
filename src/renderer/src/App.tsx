import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import PreferencePage from './pages/PreferencePage';
import DrawerAppBar from './components/DrawerAppBar';
import { SnackbarProvider } from 'notistack';

const App = (): JSX.Element => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
        typography: {
          fontFamily: ['Noto Sans JP', 'Yu Gothic', 'Roboto', 'sans-serif'].join(','),
          fontSize: 14,
        },
      }),
    [prefersDarkMode]
  );

  useEffect(() => {
    const bodyBackground =
      theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50];
    const textColor =
      theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.grey[900];

    document.body.style.backgroundColor = bodyBackground;
    document.body.style.color = textColor;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Box sx={{ display: 'flex' }}>
            <DrawerAppBar />
            <Box component="main" sx={{ p: 3 }}>
              <Toolbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/preference" element={<PreferencePage />} />
                <Route path="/account" element={<AccountPage />} />
              </Routes>
            </Box>
          </Box>
        </SnackbarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
