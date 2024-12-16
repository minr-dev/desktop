import { format } from 'date-fns';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { PlanAndActualCsv } from '@main/dto/PlanAndActualCsv';
import type { ICategoryService } from '@main/services/ICategoryService';
import type { ICsvCreateService } from '@main/services/ICsvCreateService';
import { IPlanAndActualCsvSearchService } from '@main/services/IPlanAndActualCsvSearchService';
import type { IEventEntryService } from '@main/services/IEventEntryService';
import type { ILabelService } from '@main/services/ILabelService';
import type { IProjectService } from '@main/services/IProjectService';
import type { ITaskService } from '@main/services/ITaskService';
import type { IUserDetailsService } from '@main/services/IUserDetailsService';
import { Category } from '@shared/data/Category';
import { eventDateTimeToDate } from '@shared/data/EventDateTime';
import { EventEntry } from '@shared/data/EventEntry';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { Label } from '@shared/data/Label';
import { Project } from '@shared/data/Project';
import { Task } from '@shared/data/Task';

const EVENT_TYPE_NAME: Record<string, string> = {
  PLAN: '予定',
  ACTUAL: '実績',
  SHARED: '共有',
};

const planAndActualCsvHeader: PlanAndActualCsv = {
  eventEntryId: '予実ID',
  eventType: '予実種類',
  start: '開始日時',
  end: '終了日時',
  summary: 'タイトル',
  projectId: 'プロジェクトID',
  projectName: 'プロジェクト名',
  categoryId: 'カテゴリーID',
  categoryName: 'カテゴリー名',
  taskId: 'タスクID',
  taskName: 'タスク名',
  labelIds: 'ラベルID',
  labelNames: 'ラベル名',
  description: '概要',
};

@injectable()
export class PlanAndActualCsvSearchServiceImpl implements IPlanAndActualCsvSearchService {
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
    private readonly labelService: ILabelService,
    @inject(TYPES.PlanAndActualCsvCreateService)
    private readonly csvService: ICsvCreateService<PlanAndActualCsv>
  ) {}

  async searchPlanAndActualCsv(
    planAndActualCsvSetting: PlanAndActualCsvSetting
  ): Promise<PlanAndActualCsv[]> {
    const userId = await this.userDetailsService.getUserId();
    const planAndActualCsvData: PlanAndActualCsv[] = [planAndActualCsvHeader];
    const eventEntrys: EventEntry[] = (
      await this.eventEntryService.list(
        userId,
        planAndActualCsvSetting.start,
        planAndActualCsvSetting.end,
        planAndActualCsvSetting.eventType
      )
    ).filter((event) => event.deleted == null);
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
      const labelIds =
        labels.filter((label) => eventEntryLabelIds.includes(label.id))?.map((label) => label.id) ||
        [];
      const labelNames =
        labels
          .filter((label) => eventEntryLabelIds.includes(label.id))
          ?.map((label) => label.name) || [];
      const planAndActualCsvRecord: PlanAndActualCsv = {
        eventEntryId: eventEntry.id,
        eventType: EVENT_TYPE_NAME[eventEntry.eventType],
        start: format(eventDateTimeToDate(eventEntry.start), 'yyyy/MM/dd HH:mm'),
        end: format(eventDateTimeToDate(eventEntry.end), 'yyyy/MM/dd HH:mm'),
        summary: eventEntry.summary,
        projectId: projects.find((project) => project.id === eventEntry.projectId)?.id || '',
        projectName: projects.find((project) => project.id === eventEntry.projectId)?.name || '',
        categoryId: categories.find((category) => category.id === eventEntry.categoryId)?.id || '',
        categoryName:
          categories.find((category) => category.id === eventEntry.categoryId)?.name || '',
        taskId: tasks.find((task) => task.id === eventEntry.taskId)?.id || '',
        taskName: tasks.find((task) => task.id === eventEntry.taskId)?.name || '',
        labelIds: this.csvService.convertArrayToString(labelIds),
        labelNames: this.csvService.convertArrayToString(labelNames),
        description: eventEntry.description || '',
      };
      planAndActualCsvData.push(planAndActualCsvRecord);
    }
    return planAndActualCsvData;
  }
}
