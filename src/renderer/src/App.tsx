import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import PreferencePage from './pages/PreferencePage';
import DrawerAppBar from './components/DrawerAppBar';

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  console.log(prefersDarkMode);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light'
        }
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
