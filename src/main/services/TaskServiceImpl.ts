import { TYPES } from '@main/types';
import { Page, Pageable } from '@shared/data/Page';
import { Task, TASK_STATUS } from '@shared/data/Task';
import { UniqueConstraintError } from '@shared/errors/UniqueConstraintError';
import { inject, injectable } from 'inversify';
import { DataSource } from './DataSource';
import { ITaskService } from './ITaskService';
import type { IUserDetailsService } from './IUserDetailsService';

interface taskQuery {
  minr_user_id: string;
  projectId?: string;
}

/**
 * Taskを永続化するサービス
 */
@injectable()
export class TaskServiceImpl implements ITaskService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Task>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: ['name', 'projectId'], unique: true },
    ]);
  }

  get tableName(): string {
    return 'task.db';
  }

  /**
   * Task のリストを取得
   *
   * @param {Pageable} pageable - ページング情報を含むオブジェクト
   * @param {boolean} isFilterByProject - プロジェクトIDによるフィルターの有無
   * @param {string} projectId - プロジェクトID
   * @returns {Promise<Page<Task>>} - ページを含むタスクオブジェクト
   */
  async list(pageable: Pageable, isFilterByProject = false, projectId = ''): Promise<Page<Task>> {
    const userId = await this.userDetailsService.getUserId();
    const query: taskQuery = { minr_user_id: userId };
    // projectId が無い場合はフィルタリングを行わないため taskQuery に設定しない
    if (isFilterByProject) {
      query.projectId = projectId;
    }
    const sort = {};
    if (pageable.sort) {
      sort[pageable.sort.property] = pageable.sort.direction === 'asc' ? 1 : -1;
    }
    const totalElements = await this.dataSource.count(this.tableName, query);
    const taskContent = await this.dataSource.find(
      this.tableName,
      query,
      sort,
      pageable.pageNumber * pageable.pageSize,
      pageable.pageSize
    );
    return new Page<Task>(taskContent, totalElements, pageable);
  }

  /**
   * 特定の Task の取得
   *
   * @param {string} id - タスクID
   * @returns {Promise<Task>} - タスクオブジェクト
   */
  async get(id: string): Promise<Task> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id: id, minr_user_id: userId });
  }

  async getAll(ids: string[]): Promise<Task[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(this.tableName, {
      id: { $in: ids },
      minr_user_id: userId,
    });
  }
  async getUncompletedByPriority(): Promise<Task[]> {
    const userId = await this.userDetailsService.getUserId();
    const query = {
      minr_user_id: userId,
      status: TASK_STATUS.UNCOMPLETED,
      plannedHours: { $ne: null, $exists: true },
    };
    // 本来であればDB側のソート機能を使いたい
    // しかし、NeDBに null 値の順番を調整する機能がないため、javaScriptでソートを行う
    return (await this.dataSource.find(this.tableName, query)).sort((t1, t2) => {
      if (t1.priority !== t2.priority) {
        return t2.priority - t1.priority;
      }
      if (!t1.dueDate && !t2.dueDate) {
        return 0;
      }
      if (!t1.dueDate) {
        return 1;
      }
      if (!t2.dueDate) {
        return -1;
      }
      return t1.dueDate.getTime() - t2.dueDate.getTime();
    });
  }

  /**
   * Task の保存・更新
   *
   * @param {Task} task - タスクオブジェクト
   * @returns {Promise<Task>}
   */
  async save(task: Task): Promise<Task> {
    const userId = await this.userDetailsService.getUserId();
    const data = { ...task, minr_user_id: userId };
    if (!data.id || data.id.length === 0) {
      data.id = await this.dataSource.generateUniqueId();
    }
    try {
      return await this.dataSource.upsert(this.tableName, data);
    } catch (e) {
      if (this.dataSource.isUniqueConstraintViolated(e)) {
        throw new UniqueConstraintError(
          `Task name and projectId must be unique: ${task.name}, ${task.projectId}`,
          e as Error
        );
      }
      throw e;
    }
  }

  /**
   * 特定の Task の削除
   *
   * @param {string} id - タスクID
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: id, minr_user_id: userId });
  }

  /**
   * Task の削除
   *
   * @param {string[]} ids - タスクIDの配列
   * @returns {Promise<void>}
   */
  async bulkDelete(ids: string[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }
}
