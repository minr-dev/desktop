import TimeTable from '@renderer/components/timeTable/TimeTable';

const HomePage = (): JSX.Element => {
  console.log('HomePage');

  return (
    <>
      <p>タイムテーブル</p>
      <TimeTable />
    </>
  );
};

export default HomePage;
