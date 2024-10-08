import { Box, Chip } from '@mui/material';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { useLabelMap } from '@renderer/hooks/useLabelMap';
import { useProjectMap } from '@renderer/hooks/useProjectMap';
import { useCategoryMap } from '@renderer/hooks/useCategoryMap';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';
import { useTaskMap } from '@renderer/hooks/useTaskMap';
import rendererContainer from '../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

interface EventSlotTextProps {
  eventTimeCell: EventEntryTimeCell;
}

export const EventSlotText = ({ eventTimeCell }: EventSlotTextProps): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'EventSlotText' });
  if (logger.isDebugEnabled()) logger.debug(`EventSlotText called with: ${eventTimeCell.summary}`);

  const { projectMap, isLoading: isProjectLoading } = useProjectMap();
  const { categoryMap, isLoading: isCategoryLoading } = useCategoryMap();
  const { taskMap, isLoading: isTaskLoading } = useTaskMap();
  const { labelMap, isLoading: isLabelLoading } = useLabelMap();

  const chips: JSX.Element[] = [];

  if (eventTimeCell.event.isProvisional) {
    chips.push(
      <Chip
        key={`provisional`}
        label={'仮'}
        style={{ marginRight: '2px', backgroundColor: 'white' }}
        variant="outlined"
      />
    );
  }

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
      const textColor = getOptimalTextColor(category.color);
      chips.push(
        <Chip
          key={`category-${category.id}`}
          label={category.name}
          style={{
            backgroundColor: category.color,
            marginRight: '2px',
            padding: '1px',
            color: textColor,
          }}
          size="small"
          variant="outlined"
        />
      );
    }
  }

  if (!isTaskLoading && eventTimeCell.event.taskId) {
    const task = taskMap.get(eventTimeCell.event.taskId);
    if (task) {
      chips.push(
        <Chip
          key={`task-${task.id}`}
          label={task.name}
          style={{ marginRight: '2px' }}
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
      const textColor = getOptimalTextColor(label.color);
      chips.push(
        <Chip
          key={`label-${label.id}`}
          label={label.name}
          style={{ backgroundColor: label.color, marginRight: '2px', color: textColor }}
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
