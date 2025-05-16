import { SelectedDateContext } from './common';
import { useContext, useEffect, useState } from 'react';
import { addHours } from 'date-fns';
import { BarChart } from '@mui/x-charts/BarChart';
import { ActivityUsage } from '@shared/data/ActivityUsage';
import { useActivityUsage } from '@renderer/hooks/useActivityUsage';

interface ActivitySlotProps {
  hourNum: number;
}

/**
 * ActivitySlot はアクティビティの枠にバーチャートを表示する
 *
 */
export const ActivitySlot = ({ hourNum }: ActivitySlotProps): JSX.Element => {
  const targetDate = useContext(SelectedDateContext);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { activityUsage } = useActivityUsage(startDate, endDate);

  useEffect(() => {
    if (!targetDate) {
      return;
    }
    setStartDate(addHours(targetDate, hourNum));
    setEndDate(addHours(targetDate, hourNum + 1));
  }, [targetDate, setStartDate, setEndDate]);

  const summerizeAsOther = (activityUsage: ActivityUsage[], topN: number): ActivityUsage[] => {
    if (activityUsage.length <= topN) {
      return activityUsage;
    }
    const ret = activityUsage.slice(0, topN);
    const others = activityUsage.slice(topN);
    ret.push({
      basename: 'その他',
      color: '#7d7d7d',
      usageTime: others.reduce((acc, other) => acc + other.usageTime, 0),
    });
    return ret;
  };

  const displayHours = (totalMinutes: number | null): string => {
    if (totalMinutes === null) {
      return '';
    }
    const hours = Math.trunc(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours !== 0) {
      return hours + '時間' + (minutes === 0 ? '' : minutes + '分');
    } else {
      return minutes + '分';
    }
  };

  return (
    <BarChart
      series={summerizeAsOther(activityUsage, 5).map((activity) => ({
        data: [Math.round(activity.usageTime / (60 * 1000))],
        label: activity.basename,
        color: activity.color ?? undefined,
        valueFormatter: displayHours,
        stack: 'total',
      }))}
      yAxis={[{ data: [''], scaleType: 'band' }]}
      xAxis={[{ valueFormatter: displayHours, max: 60 }]}
      layout="horizontal"
      tooltip={{ trigger: 'item' }}
      grid={{ vertical: false, horizontal: false }}
      slotProps={{
        legend: { hidden: true },
        axisLine: { display: 'none' },
      }}
      margin={{
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      }}
    />
  );
};
