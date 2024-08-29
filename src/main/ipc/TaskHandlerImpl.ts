import type { ITaskService } from "@main/services/ITaskService";
import { TYPES } from "@main/types";
import { IpcChannel } from "@shared/constants";
import { Pageable, PageResponse } from "@shared/data/Page";
import { Task } from "@shared/data/Task";
import { ipcMain } from "electron";
import { inject, injectable } from "inversify";
import { handleDatabaseOperation } from "./dbHandlerUtil";
import type { IIpcHandlerInitializer } from "./IIpcHandlerInitializer";

/**
 * Taskのデータの取得用の IPC ハンドラー
 */
@injectable()
export class TaskHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.TaskService)
    private readonly taskService: ITaskService
  ) { }

  init(): void {
    ipcMain.handle(IpcChannel.TASK_LIST, async (_event, pageRequest, projectId) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<Task>> => {
        const page = await this.taskService.list(Pageable.fromPageRequest(pageRequest), projectId);
        return page.toPageResponse();
      });
    });

    ipcMain.handle(IpcChannel.TASK_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<Task> => {
        return await this.taskService.get(id);
      });
    });

    ipcMain.handle(IpcChannel.TASK_SAVE, async (_event, task) => {
      return handleDatabaseOperation(async (): Promise<Task> => {
        return await this.taskService.save(task)
      });
    });

    ipcMain.handle(IpcChannel.TASK_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.taskService.delete(id);
      });
    });

    ipcMain.handle(IpcChannel.TASK_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.taskService.bulkDelete(ids);
      });
    });
  }
}
