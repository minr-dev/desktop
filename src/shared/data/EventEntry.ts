import { EventDateTime } from './EventDateTime';
import { ExternalEventEntryId } from './ExternalEventEntry';
import { NotificationSettings } from './NotificationSettings';

export const EVENT_TYPE = {
  PLAN: 'PLAN',
  ACTUAL: 'ACTUAL',
  SHARED: 'SHARED',
} as const;
export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

// 現在、予定レーンに表示されるイベントか実績レーンに表示されるイベントかを指定する際に
// `EVENT_TYPE.PLAN`と`EVENT_TYPE.ACTUAL`で指定しているがこれは大変紛らわしい
// TODO: 予定レーンのイベントかか実績レーンのイベントかの判定を以下を使って書き換える

// export const EVENT_TYPE_GROUP_KEY = {
//   PLAN: 'PLAN',
//   ACTUAL: 'ACTUAL',
// } as const;
// export type EVENT_TYPE_GROUP_KEY = (typeof EVENT_TYPE_GROUP_KEY)[keyof typeof EVENT_TYPE_GROUP_KEY];
// export const EVENT_TYPE_GROUP: { [K in EVENT_TYPE_GROUP_KEY]: readonly EVENT_TYPE[] } = {
//   PLAN: [EVENT_TYPE.PLAN, EVENT_TYPE.SHARED],
//   ACTUAL: [EVENT_TYPE.ACTUAL],
// };

/**
 * EventEntry は、イベントを表す。
 *
 * - EVENT_TYPE（計画、実績、共有）で分類される。
 * - 開始時間と終了時間のペアか、一日全体のイベント（休みや外部研修参加など）がある。
 * - deleted が null でない場合、削除された予定である。
 * - lastSynced が null でない場合、外部のカレンダーと同期された予定である。
 * - externalEventEntryId が null でない場合、外部のカレンダーのイベントである。
 * - isProvisional が true の場合、自動登録されてから確定されていない仮状態のイベントである。
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
  taskId?: string | null;
  labelIds?: string[] | null;
  notificationSetting?: NotificationSettings;
  isProvisional: boolean;
  updated: Date;
  deleted?: Date | null;
  lastSynced?: Date | null;
  externalEventEntryId?: ExternalEventEntryId | null;
}
