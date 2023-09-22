import { TimeCell } from './common';
import { ActivitySlot } from './ActivitySlot';
import { EventTimeCell } from '@renderer/services/EventTimeCell';
import { TimeLeneContainer } from './TimeLane';
import { ActivitySlotText } from './ActivitySlotText';

interface ActivityTableLaneProps {
  overlappedEvents: EventTimeCell[];
}

/**
 * ActivityTableLane は、タイムラインのアクティビティの列を表示する
 *
 */
export const ActivityTableLane = ({ overlappedEvents }: ActivityTableLaneProps): JSX.Element => {
  return (
    <TimeLeneContainer name={'activity'}>
      {overlappedEvents.map((oe) => (
        <ActivitySlot key={oe.id} eventTimeCell={oe}>
          <ActivitySlotText eventTimeCell={oe} />
        </ActivitySlot>
      ))}
      {Array.from({ length: 24 }).map((_, i, self) => (
        <TimeCell key={i} isBottom={i === self.length - 1} isRight={true} />
      ))}
    </TimeLeneContainer>
  );
};
