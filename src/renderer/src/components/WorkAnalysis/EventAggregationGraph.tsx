import { BarChart, ChartsXAxis } from '@mui/x-charts';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { useMemo } from 'react';

interface EventAggregationGraphProps {
  graphTitle: string;
  valueFormatter: (totalMinutes: number | null) => string;
  eventAggregationPlan: EventAggregationTime[];
  eventAggregationActual: EventAggregationTime[];
}

interface DataSet {
  name: string;
  plan: number;
  actual: number;
}

export const EventAggregationGraph = ({
  graphTitle,
  valueFormatter,
  eventAggregationPlan,
  eventAggregationActual,
}: EventAggregationGraphProps): JSX.Element => {
  const GRAPH_HEIGHT = 400;
  const dataSet = useMemo(() => {
    const eventNameList = Array.from(
      new Set([...eventAggregationPlan, ...eventAggregationActual].map((event) => event.name))
    );
    const dataSet: DataSet[] = [];
    eventNameList.forEach((name) => {
      const planAggregation = eventAggregationPlan.find((event) => event.name === name);
      const actualAggregation = eventAggregationActual.find((event) => event.name === name);
      dataSet.push({
        name: name,
        plan: planAggregation ? planAggregation.aggregationTime : 0,
        actual: actualAggregation ? actualAggregation.aggregationTime : 0,
      });
    });
    return dataSet;
  }, [eventAggregationPlan, eventAggregationActual]);
  return (
    <>
      <BarChart
        height={GRAPH_HEIGHT}
        dataset={dataSet.map((data) => ({
          name: data.name,
          plan: Math.round(data.plan / (60 * 1000)),
          actual: Math.round(data.actual / (60 * 1000)),
        }))}
        yAxis={[
          {
            dataKey: 'name',
            scaleType: 'band',
          },
        ]}
        series={[
          { dataKey: 'plan', label: '予定', valueFormatter },
          { dataKey: 'actual', label: '実績', valueFormatter },
        ]}
        xAxis={[
          {
            scaleType: 'time',
            valueFormatter,
            tickNumber: 20,
          },
        ]}
        layout="horizontal"
        margin={{ left: 100, right: 100 }}
        grid={{ vertical: false, horizontal: true }}
      >
        <ChartsXAxis label={graphTitle} />
      </BarChart>
    </>
  );
};
