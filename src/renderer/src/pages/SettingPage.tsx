import rendererContainer from '../inversify.config';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormControl,
  Grid,
  Paper,
  Alert,
  Button,
  Box,
  Stack,
  Backdrop,
  useTheme,
  FormLabel,
  RadioGroup,
  Radio,
  PaletteMode,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useForm, SubmitHandler, Controller, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UserPreference } from '@shared/data/UserPreference';
import { useSnackbar } from 'notistack';
import { TYPES } from '@renderer/types';
import { IUserPreferenceProxy } from '@renderer/services/IUserPreferenceProxy';
import UserContext from '@renderer/components/UserContext';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { GeneralSetting } from '@renderer/components/settings/GeneralSetting';
import { GoogleCalendarSetting } from '@renderer/components/settings/GoogleCalendarSetting';
import { CategoryList } from '@renderer/components/category/CategoryList';
import { AccountSetting } from '@renderer/components/settings/AccountSetting';

export const SettingPage = (): JSX.Element => {
  console.log('SettingPage');
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="一般" {...a11yProps(0)} />
          <Tab label="Googleカレンダー" {...a11yProps(1)} />
          <Tab label="作業区分" {...a11yProps(2)} />
          <Tab label="アカウント" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <GeneralSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <GoogleCalendarSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <CategoryList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <AccountSetting />
      </CustomTabPanel>
    </>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps): JSX.Element => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number): Record<string, unknown> => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
