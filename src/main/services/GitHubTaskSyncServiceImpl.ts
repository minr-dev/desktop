import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { DateUtil } from '@shared/utils/DateUtil';
import {
  GitHubProjectV2FieldOf,
  GitHubProjectV2FieldType,
  GitHubProjectV2Item,
} from '@shared/data/GitHubProjectV2Item';
import { Task, TASK_PRIORITY, TASK_STATUS } from '@shared/data/Task';
import type { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import type { IGitHubProjectV2ItemStoreService } from './IGitHubProjectV2ItemStoreService';
import type { ITaskService } from './ITaskService';
import { Pageable } from '@shared/data/Page';
import { IGitHubTaskSyncService } from './IGitHubTaskSyncService';
import type { IProjectService } from './IProjectService';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('GitHubTaskSync');

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

/**
 * 取り込んでいた GitHub のプロジェクトアイテムを用いて、Minr のタスクを生成する。
 *
 * 生成済みのプロジェクトアイテムの場合は、Minr の生成済みタスクを更新する。
 * 現時点では、Minr 側の更新で GitHub 側のプロジェクトアイテムを更新することはしない。
 */
@injectable()
export class GitHubTaskSyncServiceImpl implements IGitHubTaskSyncService {
  constructor(
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil,
    @inject(TYPES.GitHubProjectV2StoreService)
    private readonly gitHubProjectV2StoreService: IGitHubProjectV2StoreService,
    @inject(TYPES.GitHubProjectV2ItemStoreService)
    private readonly gitHubProjectV2ItemStoreService: IGitHubProjectV2ItemStoreService,
    @inject(TYPES.ProjectService)
    private readonly projectService: IProjectService,
    @inject(TYPES.TaskService)
    private readonly taskService: ITaskService
  ) {}

  // TODO: プロジェクト毎にカスタムできるようにする
  // 現時点では、GitHubのプロジェクトテンプレートを使ったときの割り当てにしたがって作成している。
  private STATUS_FIELD_NAME = 'Status';
  private STATUS_MAP = new Map<string, TASK_STATUS>([
    ['BackLog', TASK_STATUS.UNCOMPLETED],
    ['Ready', TASK_STATUS.UNCOMPLETED],
    ['In Progress', TASK_STATUS.UNCOMPLETED],
    ['In Review', TASK_STATUS.UNCOMPLETED],
    ['Done', TASK_STATUS.COMPLETED],
  ]);
  private PRIORITY_FIELD_NAME = 'Priority';
  private PRIORITY_MAP = new Map<string, TASK_PRIORITY>([
    ['P0', TASK_PRIORITY.HIGH],
    ['P1', TASK_PRIORITY.MEDIUM],
    ['P2', TASK_PRIORITY.LOW],
  ]);
  private ESTIMATED_HOURS_FIELD_NAME = 'Estimate';

  async syncGitHubProjectV2Item(minrProjectId: string): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug('syncGitHubProjectV2Item', minrProjectId);
    try {
      const minrProject = await this.projectService.get(minrProjectId);
      if (!minrProject) {
        throw new Error('minrProject was not found.');
      }
      if (!minrProject.gitHubProjectV2Id) {
        throw new Error('GitHub integration settings are not configured.');
      }
      const githubProject = await this.gitHubProjectV2StoreService.get(
        minrProject.gitHubProjectV2Id
      );
      if (!githubProject) {
        throw new Error('githubProject was not found.');
      }
      const gitHubItems = await this.gitHubProjectV2ItemStoreService.list(githubProject.id);
      const tasks = (await this.taskService.list(PAGEABLE)).content;
      const itemIdMap = new Map(
        tasks
          .map((task) => {
            if (task.githubProjectItemId) {
              return [task.githubProjectItemId, task];
            } else {
              return null;
            }
          })
          .filter((mapItem): mapItem is [string, Task] => mapItem != null)
      );
      const updatedTasks: Task[] = [];
      for (const item of gitHubItems) {
        const task = itemIdMap.get(item.id);
        if (task && item.updated_at < task.updated) {
          // GitHubの更新がMinrタスクの更新より前の場合は更新しない
          if (logger.isDebugEnabled()) logger.debug('skip: ', item.title);
          continue;
        }
        if (logger.isDebugEnabled()) logger.debug('update Task: ', item.title);
        updatedTasks.push(this.convGitHubTask(item, minrProject.id, task));
      }
      await Promise.all(updatedTasks.map((task) => this.taskService.save(task)));
    } catch (e) {
      logger.error('An Error was occured in GitHub task syncing: ', e);
      throw e;
    }
  }

  private getGitHubItemFieldByName<T extends GitHubProjectV2FieldType>(
    item: GitHubProjectV2Item,
    fieldName: string,
    dataType: T
  ): GitHubProjectV2FieldOf<T> | null {
    const field = item.fieldValues.find(
      (field) => field.name == fieldName && field.dataType == dataType
    );
    return field ? (field as GitHubProjectV2FieldOf<T>) : null;
  }

  private mappingSingleSelectField<K extends keyof Task>(
    fieldName: string,
    map: Map<string, Task[K]>,
    defaultValue: Task[K],
    item: GitHubProjectV2Item
  ): Task[K] {
    const gitHubStatusField = this.getGitHubItemFieldByName(
      item,
      fieldName,
      GitHubProjectV2FieldType.SINGLE_SELECT
    );
    if (gitHubStatusField?.value) {
      return map.get(gitHubStatusField.value) ?? defaultValue;
    }
    return defaultValue;
  }

  private convGitHubTask(
    item: GitHubProjectV2Item,
    minrProjectId: string,
    previousTask?: Task
  ): Task {
    logger.debug('convGitHubTask', previousTask);
    const taskStatus = this.mappingSingleSelectField<'status'>(
      this.STATUS_FIELD_NAME,
      this.STATUS_MAP,
      previousTask ? previousTask.status : TASK_STATUS.UNCOMPLETED,
      item
    );
    const taskPriority = this.mappingSingleSelectField<'priority'>(
      this.PRIORITY_FIELD_NAME,
      this.PRIORITY_MAP,
      previousTask ? previousTask.priority : TASK_PRIORITY.MEDIUM,
      item
    );
    const estimatedHoursField = this.getGitHubItemFieldByName(
      item,
      this.ESTIMATED_HOURS_FIELD_NAME,
      GitHubProjectV2FieldType.NUMBER
    );
    const estimatedHours = estimatedHoursField?.value ?? previousTask?.plannedHours;
    // mongodb や nedb の場合、 _id などのエンティティとしては未定義の項目が埋め込まれていることがあり
    // それらの項目を使って更新処理が行われるため、`...previousTask` で隠れた項目もコピーされるようにする
    return {
      ...previousTask,
      id: previousTask ? previousTask.id : '',
      name: item.title,
      projectId: minrProjectId,
      description: item.description ?? (previousTask ? previousTask.description : item.title),
      status: taskStatus,
      plannedHours: estimatedHours,
      githubProjectItemId: item.id,
      updated: this.dateUtil.getCurrentDate(),
      priority: taskPriority,
    };
  }
}
