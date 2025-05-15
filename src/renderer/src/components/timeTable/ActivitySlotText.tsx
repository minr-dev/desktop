import { Box } from '@mui/material';
import { EventTimeCell } from '@renderer/components/timeTable/EventTimeCell';

interface ActivitySlotTextProps {
  eventTimeCell: EventTimeCell;
}

export const ActivitySlotText = ({ eventTimeCell }: ActivitySlotTextProps): JSX.Element => {
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
