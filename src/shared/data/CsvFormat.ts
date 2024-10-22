const eventEntryCsvHeader = {
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

export const CSV_HEADER_TYPE = {
  EVENT_ENTRY: eventEntryCsvHeader,
} as const;
export type CSV_HEADER_TYPE = (typeof CSV_HEADER_TYPE)[keyof typeof CSV_HEADER_TYPE];
