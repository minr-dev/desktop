import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import type { ICategoryService } from '@main/services/ICategoryService';
import { IEventEntrySearchService } from '@main/services/IEventEntrySearchService';
import type { IEventEntryService } from '@main/services/IEventEntryService';
import type { ILabelService } from '@main/services/ILabelService';
import type { IProjectService } from '@main/services/IProjectService';
import type { ITaskService } from '@main/services/ITaskService';
import type { IUserDetailsService } from '@main/services/IUserDetailsService';
import { Category } from '@shared/data/Category';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { Label } from '@shared/data/Label';
import { Project } from '@shared/data/Project';
import { Task } from '@shared/data/Task';

/**
 * EventEntryの検索を行う
 *
 * EventEntryの検索とそれに紐づくProject等のデータの検索と結合をする。
 */
@injectable()
export class EventEntrySearchServiceImpl implements IEventEntrySearchService {
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

  async searchPlanAndActual(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE | undefined
  ): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, start, end, eventType)
    ).filter((event) => event.deleted == null);
    const projects: Project[] = await this.searchProjects(eventEntrys);
    const categories: Category[] = await this.searchCategories(eventEntrys);
    const tasks: Task[] = await this.searchTasks(eventEntrys);
    const labels: Label[] = await this.searchLabels(eventEntrys);

    const planAndActuals: EventEntrySearch[] = [];
    for (const eventEntry of eventEntrys) {
      const project = projects.find((project) => project.id === eventEntry.projectId);
      const category = categories.find((category) => category.id === eventEntry.categoryId);
      const task = tasks.find((task) => task.id === eventEntry.taskId);
      const labelIds = labels
        .filter((label) => eventEntry.labelIds?.includes(label.id))
        ?.map((label) => label.id);
      const labelNames = labels
        .filter((label) => eventEntry.labelIds?.includes(label.id))
        ?.map((label) => label.name);

      const planAndActual: EventEntrySearch = {
        eventEntryId: eventEntry.id,
        eventType: eventEntry.eventType,
        start: eventEntry.start,
        end: eventEntry.end,
        summary: eventEntry.summary,
        projectId: project?.id,
        projectName: project?.name,
        categoryId: category?.id,
        categoryName: category?.name,
        taskId: task?.id,
        taskName: task?.name,
        labelIds: labelIds,
        labelNames: labelNames,
        description: eventEntry.description,
      };
      planAndActuals.push(planAndActual);
    }
    return planAndActuals;
  }

  async searchLabelAssociatedEvent(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, start, end)
    ).filter((event) => event.deleted == null);
    const filteredEvents = eventType === EVENT_TYPE.ACTUAL ?
      eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL):
      eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const labels: Label[] = await this.searchLabels(eventEntrys);
    const associatedEvents: EventEntrySearch[] = [];
    for (const eventEntry of filteredEvents) {
      const labelIds = eventEntry.labelIds;
      const labelNames = labels
        .filter((label) => labelIds?.includes(label.id))
        .map((label) => label.name);
      const associatedEvent: EventEntrySearch = {
        eventEntryId: eventEntry.id,
        eventType: eventEntry.eventType,
        start: eventEntry.start,
        end: eventEntry.end,
        summary: eventEntry.summary,
        labelIds: labelIds,
        labelNames: labelNames,
      };
      associatedEvents.push(associatedEvent);
    }
    return associatedEvents;
  }

  private async searchProjects(eventEntrys: EventEntry[]): Promise<Project[]> {
    return await this.projectService.getAll(
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
  }

  private async searchCategories(eventEntrys: EventEntry[]): Promise<Category[]> {
    return await this.categoryService.getAll(
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
  }

  private async searchTasks(eventEntrys: EventEntry[]): Promise<Task[]> {
    return await this.taskService.getAll(
      Array.from(
        new Set(
          eventEntrys
            .map((eventEntry) => eventEntry.taskId)
            .filter((taskId): taskId is string => taskId !== null && taskId !== undefined)
        )
      )
    );
  }

  private async searchLabels(eventEntrys: EventEntry[]): Promise<Label[]> {
    return await this.labelService.getAll(
      Array.from(new Set(eventEntrys.map((eventEntry) => eventEntry.labelIds || []).flat()))
    );
  }
}
