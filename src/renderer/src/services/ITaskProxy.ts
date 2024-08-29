import { Task } from "@shared/data/Task";
import { ICRUDProxy } from "./ICRUDProxy";
import { Page, Pageable } from "@shared/data/Page";

export interface ITaskProxy extends ICRUDProxy<Task> {
    list(pageable: Pageable, projectId?: string): Promise<Page<Task>>;
    get(id: string): Promise<Task>;
    save(task: Task): Promise<Task>;
    delete(id: string): Promise<void>;
    bulkDelete(ids: string[]): Promise<void>;
}