import { styled } from '@mui/system';
import { useDrop } from 'react-dnd';
import rendererContainer from '../inversify.config';
import { TIME_CELL_HEIGHT, startHourLocal } from './timeTable/common';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { differenceInHours, setHours, setMinutes } from 'date-fns';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { TYPES } from '@renderer/types';
import { useEventEntries } from '@renderer/hooks/useEventEntries';

export const HourLine = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isLast' && prop !== 'isRightmost',
})<{ isLast: boolean; isRightmost: boolean }>(({ isLast, isRightmost }) => ({
  height: isLast ? `${TIME_CELL_HEIGHT}rem` : `calc(${TIME_CELL_HEIGHT}rem - 1px)`,
  display: 'flex',
  alignItems: 'center',
  border: '1px solid grey',
  borderBottom: isLast ? '1px solid grey' : 'none',
  borderRight: isRightmost ? '1px solid grey' : 'none',
  width: '100%',
}));

interface DroppableHourLineProps {
  isLast: boolean;
  isRightmost: boolean;
  eventType: EVENT_TYPE;
  hour: number;
  onClick: () => void;
  onDrop: (event: EventEntry, hour: number) => void;
}

export const DroppableHourLine = ({
  isLast,
  isRightmost,
  eventType,
  hour,
  onClick,
  onDrop,
}: DroppableHourLineProps): JSX.Element => {
  const [, ref] = useDrop({
    accept: 'PLAN', //eventType,
    drop: async (item: { event: EventEntry }) => {
      onDrop(item.event, hour);
    },
    canDrop: (item, monitor) => {
      // ドロップが許可される条件を定義
      console.log(monitor.getItem());
      return true;
    },
  });

  return <HourLine isLast={isLast} isRightmost={isRightmost} onClick={onClick}></HourLine>;
};
