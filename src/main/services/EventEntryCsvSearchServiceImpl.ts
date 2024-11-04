import { format } from 'date-fns';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { ICategoryService } from '@main/services/ICategoryService';
import { IEventEnryCsvSearchService } from '@main/services/IEventEntryCsvSearchService';
import type { IEventEntryService } from '@main/services/IEventEntryService';
import type { ILabelService } from '@main/services/ILabelService';
import type { IProjectService } from '@main/services/IProjectService';
import type { ITaskService } from '@main/services/ITaskService';
import type { IUserDetailsService } from '@main/services/IUserDetailsService';
import { Category } from '@shared/data/Category';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EventEntry } from '@shared/data/EventEntry';
import { EVENT_TYPE_NAME, EventEntryCsv } from '@shared/data/EventEntryCsv';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';
import { Label } from '@shared/data/Label';
import { Project } from '@shared/data/Project';
import { Task } from '@shared/data/Task';

@injectable()
export class EventEntryCsvSearchServiceImpl implements IEventEnryCsvSearchService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.ProjectService)
    private readonly projectService: IProjectService,
    @inject(TYPES.CategoryService)
    private readonly categoryService: ICategoryService,
    @inject(TYPES.TaskService)
    private readonly taskService: ITaskService,
    @inject(TYPES.LabelService)
    private readonly labelService: ILabelService
  ) {}

  async searchEventEntryCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<EventEntryCsv[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntryCsvData: EventEntryCsv[] = [];
    const eventEntrys: EventEntry[] = await this.eventEntryService.list(
      userId,
      eventEntryCsvSetting.start,
      eventEntryCsvSetting.end,
      eventEntryCsvSetting.eventType
    );
    const projects: Project[] = await this.projectService.getAll(
      Array.from(
        new Set(
          eventEntrys
            .map((eventEntry) => eventEntry.projectId)
            .filter(
              (projectId): projectId is string => projectId !== null && projectId !== undefined
            )
        )
      )
    );
    const categories: Category[] = await this.categoryService.getAll(
      Array.from(
        new Set(
          eventEntrys
            .map((eventEntry) => eventEntry.categoryId)
            .filter(
              (categoryId): categoryId is string => categoryId !== null && categoryId !== undefined
            )
        )
      )
    );
    const tasks: Task[] = await this.taskService.getAll(
      Array.from(
        new Set(
          eventEntrys
            .map((eventEntry) => eventEntry.taskId)
            .filter((taskId): taskId is string => taskId !== null && taskId !== undefined)
        )
      )
    );
    const labels: Label[] = await this.labelService.getAll(
      Array.from(new Set(eventEntrys.map((eventEntry) => eventEntry.labelIds || []).flat()))
    );
    for (const eventEntry of eventEntrys) {
      const eventEntryLabelIds = eventEntry.labelIds || [];
      const eventEntryLabelNames = labels
        .filter((label) => eventEntryLabelIds.includes(label.id))
        ?.map((label) => label.name);
      const eventEntryCsvRecord: EventEntryCsv = {
        eventEntryId: eventEntry.id,
        eventType: EVENT_TYPE_NAME[eventEntry.eventType],
        start: format(eventDateTimeToDate(eventEntry.start), 'yyyy/MM/dd HH:mm'),
        end: format(eventDateTimeToDate(eventEntry.end), 'yyyy/MM/dd HH:mm'),
        summary: eventEntry.summary,
        projectId: eventEntry.projectId || '',
        projectName: projects.find((project) => project.id === eventEntry.projectId)?.name || '',
        categoryId: eventEntry.categoryId || '',
        categoryName:
          categories.find((category) => category.id === eventEntry.categoryId)?.name || '',
        taskId: eventEntry.taskId || '',
        taskName: tasks.find((task) => task.id === eventEntry.taskId)?.name || '',
        labelIds: Array.isArray(eventEntry.labelIds)
          ? eventEntry.labelIds.filter((id) => id !== null).join(",")
          : '',
        labelNames: Array.isArray(eventEntryLabelNames) ? eventEntryLabelNames.join(",") : '',
        description: eventEntry.description || '',
      };
      eventEntryCsvData.push(eventEntryCsvRecord);
    }
    return eventEntryCsvData;
  }
}
