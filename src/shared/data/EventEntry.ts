import { EventDateTime } from './EventDateTime';
import { ExternalEventEntryId } from './ExternalEventEntry';
import { NotificationSettings } from './NotificationSettings';

export const EVENT_TYPE = {
  PLAN: 'PLAN',
  ACTUAL: 'ACTUAL',
  SHARED: 'SHARED',
} as const;
export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

/**
 * EventEntry は、イベントを表す。
 *
 * - EVENT_TYPE（計画、実績、共有）で分類される。
 * - 開始時間と終了時間のペアか、一日全体のイベント（休みや外部研修参加など）がある。
 * - deleted が null でない場合、削除された予定である。
 * - lastSynced が null でない場合、外部のカレンダーと同期された予定である。
 * - externalEventEntryId が null でない場合、外部のカレンダーのイベントである。
 */
export interface EventEntry {
  id: string;
  userId: string;
  eventType: EVENT_TYPE;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  location?: string | null;
  description?: string | null;
  projectId?: string | null;
  categoryId?: string | null;
  labelIds?: string[] | null;
  notificationSetting?: NotificationSettings;
  updated: Date;
  deleted?: Date | null;
  lastSynced?: Date | null;
  externalEventEntryId?: ExternalEventEntryId | null;
}
