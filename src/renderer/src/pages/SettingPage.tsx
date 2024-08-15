import { Box, Tabs, Tab, Typography } from '@mui/material';
import React from 'react';
import { GeneralSetting } from '@renderer/components/settings/GeneralSetting';
import { GoogleCalendarSetting } from '@renderer/components/settings/GoogleCalendarSetting';
import { CategoryList } from '@renderer/components/category/CategoryList';
import { LabelList } from '@renderer/components/label/LabelList';
import { AccountSetting } from '@renderer/components/settings/AccountSetting';
import { ProjectList } from '@renderer/components/project/ProjectList';
import { PomodoroTimerSetting } from '@renderer/components/settings/PomodoroSetting';
import { ApplicationList } from '@renderer/components/application/ApplicationList';

export const SettingPage = (): JSX.Element => {
  console.log('SettingPage');
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="設定">
          <Tab label="一般" {...a11yProps(0)} />
          <Tab label="Googleカレンダー" {...a11yProps(1)} />
          <Tab label="プロジェクト" {...a11yProps(2)} />
          <Tab label="カテゴリー" {...a11yProps(3)} />
          <Tab label="ラベル" {...a11yProps(4)} />
          <Tab label="アプリ" {...a11yProps(5)} />
          <Tab label="アカウント" {...a11yProps(6)} />
          <Tab label="ポモドーロタイマー" {...a11yProps(7)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <GeneralSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <GoogleCalendarSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <ProjectList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <CategoryList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <LabelList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        <ApplicationList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        <AccountSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={7}>
        <PomodoroTimerSetting />
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
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number): Record<string, unknown> => {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
};
