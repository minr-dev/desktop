import { NotificationSettings } from './NotificationSettings';
import { Time } from './Time';

export interface PlanTemplateEvent {
  id: string;
  userId: string;
  templateId: string;
  summary: string;
  start: Time;
  end: Time;
  description?: string | null;
  projectId?: string | null;
  categoryId?: string | null;
  taskId?: string | null;
  labelIds?: string[] | null;
  notificationSetting?: NotificationSettings;
  updated: Date;
  deleted?: Date | null;
}
