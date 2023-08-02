import ScheduleTable from '@renderer/components/ScheduleTable';

const HomePage = (): JSX.Element => {
  console.log('HomePage');

  return (
    <>
      <p>タイムテーブル</p>
      <ScheduleTable />
    </>
  );
};

export default HomePage;
