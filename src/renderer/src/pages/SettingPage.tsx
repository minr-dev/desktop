import { Box, Tabs, Tab, Typography } from '@mui/material';
import React from 'react';
import { GeneralSetting } from '@renderer/components/settings/GeneralSetting';
import { GoogleCalendarSetting } from '@renderer/components/settings/GoogleCalendarSetting';
import { CategoryList } from '@renderer/components/category/CategoryList';
import { LabelList } from '@renderer/components/label/LabelList';
import { AccountSetting } from '@renderer/components/settings/AccountSetting';
import { ProjectList } from '@renderer/components/project/ProjectList';
import { PomodoroTimerSetting } from '@renderer/components/settings/PomodoroSetting';
import { TaskList } from '@renderer/components/task/TaskList';
import { PatternList } from '@renderer/components/pattern/PatternList';
import { PlanPatternList } from '@renderer/components/planPattern/PlanPatternList';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { PlanTemplateList } from '@renderer/components/planTemplate/PlanTemplateList';

const logger = getLogger('SettingPage');

export const SettingPage = (): JSX.Element => {
  logger.info('SettingPage');
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="設定"
        >
          <Tab label="一般" {...a11yProps(0)} />
          <Tab label="Googleカレンダー" {...a11yProps(1)} sx={{ textTransform: 'none' }} />
          <Tab label="プロジェクト" {...a11yProps(2)} />
          <Tab label="カテゴリー" {...a11yProps(3)} />
          <Tab label="タスク" {...a11yProps(4)} />
          <Tab label="ラベル" {...a11yProps(5)} />
          <Tab label="アクティビティパターン" {...a11yProps(6)} />
          <Tab label="予定パターン" {...a11yProps(7)} />
          <Tab label="予定テンプレート" {...a11yProps(8)} />
          <Tab label="アカウント" {...a11yProps(9)} />
          <Tab label="ポモドーロタイマー" {...a11yProps(10)} />
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
        <TaskList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        <LabelList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        <PatternList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={7}>
        <PlanPatternList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={8}>
        <PlanTemplateList />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={9}>
        <AccountSetting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={10}>
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
