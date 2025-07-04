import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import type { ICategoryService } from '@main/services/ICategoryService';
import {
  EventEntrySearchParams,
  IEventEntrySearchService,
} from '@main/services/IEventEntrySearchService';
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

  async getPlanAndActuals({
    start,
    end,
    eventType,
  }: EventEntrySearchParams): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, start, end)
    ).filter((event) => !event.deleted);
    const filteredEvents = !eventType
      ? eventEntrys
      : eventType === EVENT_TYPE.ACTUAL
      ? eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
      : eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const projects: Project[] = await this.getEventMatchProjects(filteredEvents);
    const categories: Category[] = await this.getEventMatchCategories(filteredEvents);
    const tasks: Task[] = await this.getEventMatchTasks(filteredEvents);
    const labels: Label[] = await this.getEventMatchLabels(filteredEvents);

    const planAndActuals: EventEntrySearch[] = [];
    for (const eventEntry of filteredEvents) {
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

  async getProjectAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, params.start, params.end)
    ).filter((event) => !event.deleted);
    const filteredEvents =
      params.eventType === EVENT_TYPE.ACTUAL
        ? eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
        : eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const projects: Project[] = await this.getEventMatchProjects(filteredEvents);
    const associatedEvents: EventEntrySearch[] = [];
    for (const eventEntry of filteredEvents) {
      const project = projects.find((project) => project.id === eventEntry.projectId);
      const associatedEvent: EventEntrySearch = {
        eventEntryId: eventEntry.id,
        eventType: eventEntry.eventType,
        start: eventEntry.start,
        end: eventEntry.end,
        summary: eventEntry.summary,
        projectId: project?.id,
        projectName: project?.name,
      };
      associatedEvents.push(associatedEvent);
    }
    return associatedEvents;
  }

  async getCategoryAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, params.start, params.end)
    ).filter((event) => !event.deleted);
    const filteredEvents =
      params.eventType === EVENT_TYPE.ACTUAL
        ? eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
        : eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const categories: Category[] = await this.getEventMatchCategories(filteredEvents);
    const associatedEvents: EventEntrySearch[] = [];
    for (const eventEntry of filteredEvents) {
      const category = categories.find((category) => category.id === eventEntry.categoryId);
      const associatedEvent: EventEntrySearch = {
        eventEntryId: eventEntry.id,
        eventType: eventEntry.eventType,
        start: eventEntry.start,
        end: eventEntry.end,
        summary: eventEntry.summary,
        categoryId: category?.id,
        categoryName: category?.name,
      };
      associatedEvents.push(associatedEvent);
    }
    return associatedEvents;
  }

  async getTaskAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, params.start, params.end)
    ).filter((event) => !event.deleted);
    const filteredEvents =
      params.eventType === EVENT_TYPE.ACTUAL
        ? eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
        : eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const tasks: Task[] = await this.getEventMatchTasks(filteredEvents);
    const associatedEvents: EventEntrySearch[] = [];
    for (const eventEntry of filteredEvents) {
      const task = tasks.find((task) => task.id === eventEntry.taskId);
      const associatedEvent: EventEntrySearch = {
        eventEntryId: eventEntry.id,
        eventType: eventEntry.eventType,
        start: eventEntry.start,
        end: eventEntry.end,
        summary: eventEntry.summary,
        taskId: task?.id,
        taskName: task?.name,
      };
      associatedEvents.push(associatedEvent);
    }
    return associatedEvents;
  }

  async getLabelAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]> {
    const userId = await this.userDetailsService.getUserId();
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(userId, params.start, params.end)
    ).filter((event) => !event.deleted);
    const filteredEvents =
      params.eventType === EVENT_TYPE.ACTUAL
        ? eventEntrys.filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
        : eventEntrys.filter((event) => event.eventType !== EVENT_TYPE.ACTUAL);
    const labels: Label[] = await this.getEventMatchLabels(filteredEvents);
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

  private async getEventMatchProjects(eventEntrys: EventEntry[]): Promise<Project[]> {
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

  private async getEventMatchCategories(eventEntrys: EventEntry[]): Promise<Category[]> {
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

  private async getEventMatchTasks(eventEntrys: EventEntry[]): Promise<Task[]> {
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

  private async getEventMatchLabels(eventEntrys: EventEntry[]): Promise<Label[]> {
    return await this.labelService.getAll(
      Array.from(new Set(eventEntrys.map((eventEntry) => eventEntry.labelIds || []).flat()))
    );
  }
}
