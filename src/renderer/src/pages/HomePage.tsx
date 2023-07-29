import { useEvents } from '@renderer/hooks/useEvents';
import EventTimeTable from '@renderer/components/EventTimeTable';

const HomePage = (): JSX.Element => {
  console.log('HomePage');

  const events = useEvents();

  if (events === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <p>タイムテーブル</p>
      <EventTimeTable events={events} />
    </>
  );
};

export default HomePage;
