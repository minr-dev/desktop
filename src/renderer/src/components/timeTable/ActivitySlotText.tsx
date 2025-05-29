import { Box } from '@mui/material';
import { EventTimeCell } from '@renderer/services/EventTimeCell';

interface ActivitySlotTextProps<
  TEvent,
  TEventTimeCell extends EventTimeCell<TEvent, TEventTimeCell>
> {
  eventTimeCell: TEventTimeCell;
}

export const ActivitySlotText = <
  TEvent,
  TEventTimeCell extends EventTimeCell<TEvent, TEventTimeCell>
>({
  eventTimeCell,
}: ActivitySlotTextProps<TEvent, TEventTimeCell>): JSX.Element => {
  return (
    <>
      <Box
        sx={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'left',
        }}
      >
        {eventTimeCell.icon}
        {eventTimeCell.summary}
      </Box>
    </>
  );
};
