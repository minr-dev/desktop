import { Box, Chip } from '@mui/material';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';

interface EventSlotTextProps {
  eventTimeCell: EventEntryTimeCell;
}

export const EventSlotText = ({ eventTimeCell }: EventSlotTextProps): JSX.Element => {
  console.log('EventSlotText called with:', eventTimeCell.summary);

  const { projectMap, isLoading: isProjectLoading } = useProjectMap();
  const { categoryMap, isLoading: isCategoryLoading } = useCategoryMap();
  const { labelMap, isLoading: isLabelLoading } = useLabelMap();

  const chips: JSX.Element[] = [];

  if (!isProjectLoading && eventTimeCell.event.projectId) {
    const project = projectMap.get(eventTimeCell.event.projectId);
    if (project) {
      chips.push(
        <Chip
          key={`project-${project.id}`}
          label={project.name}
          style={{ marginRight: '2px' }}
          size="small"
          variant="outlined"
        />
      );
    }
  }

  if (!isCategoryLoading && eventTimeCell.event.categoryId) {
    const category = categoryMap.get(eventTimeCell.event.categoryId);
    if (category) {
      chips.push(
        <Chip
          key={`category-${category.id}`}
          label={category.name}
          style={{ backgroundColor: category.color, marginRight: '2px', padding: '1px' }}
          size="small"
          variant="outlined"
        />
      );
    }
  }

  if (!isLabelLoading && eventTimeCell.event.labelIds) {
    for (const id of eventTimeCell.event.labelIds) {
      const label = labelMap.get(id);
      if (!label) {
        continue;
      }
      chips.push(
        <Chip
          key={`label-${label.id}`}
          label={label.name}
          style={{ backgroundColor: label.color, marginRight: '2px' }}
          size="small"
        />
      );
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
          flexShrink: 0,
        }}
      >
        {eventTimeCell.summary}
      </Box>
      <Box
        sx={{
          flexShrink: 1,
        }}
      >
        {chips}
      </Box>
    </Box>
  );
};
