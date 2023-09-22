import { Box, Chip } from '@mui/material';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { useLabelMap } from '@renderer/hooks/useLabelMap';

interface EventSlotTextProps {
  eventTimeCell: EventEntryTimeCell;
}

export const EventSlotText = ({ eventTimeCell }: EventSlotTextProps): JSX.Element => {
  const { labelMap, isLoading } = useLabelMap();
  const chips: JSX.Element[] = [];
  if (!isLoading) {
    if (eventTimeCell.event.labelIds) {
      for (const id of eventTimeCell.event.labelIds) {
        const label = labelMap.get(id);
        if (!label) {
          continue;
        }
        chips.push(
          <Chip
            key={`$label-${label.id}`}
            label={label.name}
            style={{ backgroundColor: label.color, marginRight: '2px' }}
            size="small"
          />
        );
      }
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'left',
        }}
      >
        {eventTimeCell.summary}
      </Box>
      <Box>{chips}</Box>
    </Box>
  );
};
