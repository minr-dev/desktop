import { IpcChannel } from "@shared/constants";
import { Page, Pageable } from "@shared/data/Page";
import { Task } from "@shared/data/Task";
import { injectable } from "inversify";
import { handleIpcOperation } from "./ipcErrorHandling";
import { ITaskProxy } from "./ITaskProxy";

/**
 * TaskのIPCメッセージのプロキシ
 */
@injectable()
export class TaskProxyImpl implements ITaskProxy {
  /**
   * Taskのリストを取得
   * 
   * @param {Pageable} pageable - ページング情報を含むオブジェクト
   * @param {string} [projectId=''] - プロジェクトID
   * @returns {Promise<Page<Task>>} - ページを含むタスクオブジェクト
   */
  async list(pageable: Pageable, projectId: string = ''): Promise<Page<Task>> {
    return await handleIpcOperation(async () => {
      const responce = await window.electron.ipcRenderer.invoke(
        IpcChannel.TASK_LIST,
        pageable.toPageRequest(),
        projectId
      );
      return Page.fromPageResponse(responce);
    });
  }

  /**
   * 特定の Task の取得
   * 
   * @param {string} id - タスクID
   * @returns {Promise<Task>} - タスクオブジェクト
   */
  async get(id: string): Promise<Task> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.TASK_GET, id);
    });
  }

  /**
   * Task の保存・更新
   * 
   * @param {Task} task - タスクオブジェクト 
   * @returns {Promise<Task>}
   */
  async save(task: Task): Promise<Task> {
    return await handleIpcOperation(async () => {
      const data = await window.electron.ipcRenderer.invoke(IpcChannel.TASK_SAVE, task);
      return data;
    });
  }

  /**
   * 特定の Task の削除
   * 
   * @param {string} id - タスクID
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.TASK_DELETE, id);
    });
  }

  /**
   * Task の削除
   * 
   * @param {string[]} ids - タスクIDの配列 
   * @returns {Promise<void>}
   */
  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.TASK_BULK_DELETE, ids);
    });
  }
}
