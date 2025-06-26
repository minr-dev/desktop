import { TimeCell } from './common';
import { ActivitySlot } from './ActivitySlot';
import { TimeLaneContainer } from './TimeLane';

interface ActivityTableLaneProps {
  startTime?: Date;
  activityUpdated: boolean;
}

/**
 * ActivityTableLane は、タイムラインのアクティビティの列を表示する
 *
 */
export const ActivityTableLane = ({
  startTime,
  activityUpdated,
}: ActivityTableLaneProps): JSX.Element => {
  return (
    <TimeLaneContainer name={'activity'}>
      {Array.from({ length: 24 }).map((_, i, self) => (
        <TimeCell key={i} isBottom={i === self.length - 1} isRight={true}>
          <ActivitySlot startTime={startTime} hourNum={i} activityUpdated={activityUpdated} />
        </TimeCell>
      ))}
    </TimeLaneContainer>
  );
};
