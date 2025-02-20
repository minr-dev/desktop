import { PlanAndActualCsv } from '../PlanAndActualCsv';

export class PlanAndActualCsvFixture {
  static default(override: Partial<PlanAndActualCsv> = {}): PlanAndActualCsv {
    return {
      予実ID: '1',
      予実種類: '予定',
      開始日時: '2024/12/30 10:00:00',
      終了日時: '2024/12/30 10:00:00',
      タイトル: 'test1',
      プロジェクトID: '',
      プロジェクト名: '',
      カテゴリーID: '',
      カテゴリー名: '',
      タスクID: '',
      タスク名: '',
      ラベルID: '',
      ラベル名: '',
      概要: '',
      ...override,
    };
  }
}
