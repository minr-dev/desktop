import TimeTable from '@renderer/components/timeTable/TimeTable';

const TimeTablePage = (): JSX.Element => {
  console.log('TimeTablePage');

  return (
    <>
      <p>タイムテーブル</p>
      <TimeTable />
    </>
  );
};

export default TimeTablePage;
