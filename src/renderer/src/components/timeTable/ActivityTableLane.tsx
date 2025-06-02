import { TimeCell } from './common';
import { ActivitySlot } from './ActivitySlot';
import { ActivityLaneEventTimeCell } from '@renderer/services/EventTimeCell';
import { TimeLaneContainer } from './TimeLane';
import { ActivitySlotText } from './ActivitySlotText';

interface ActivityTableLaneProps {
  isRight?: boolean;
  startTime?: Date;
  overlappedEvents: ActivityLaneEventTimeCell[];
}

/**
 * ActivityTableLane は、タイムラインのアクティビティの列を表示する
 *
 */
export const ActivityTableLane = ({
  isRight = false,
  overlappedEvents,
}: ActivityTableLaneProps): JSX.Element => {
  return (
    <TimeLaneContainer name={'activity'}>
      {overlappedEvents.map((oe) => (
        <ActivitySlot key={oe.id} eventTimeCell={oe}>
          <ActivitySlotText eventTimeCell={oe} />
        </ActivitySlot>
      ))}
      {Array.from({ length: 24 }).map((_, i, self) => (
        <TimeCell key={i} isBottom={i === self.length - 1} isRight={isRight} />
      ))}
    </TimeLaneContainer>
  );
};
