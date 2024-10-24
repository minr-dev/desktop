import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import { IActivityColorService } from './IActivityColorService';
import { DataSource } from './DataSource';
import { ActivityColor } from '@shared/data/ActivityColor';
import { DateUtil } from '@shared/utils/DateUtil';
import { getLogger } from '@main/utils/LoggerUtil';

export const COLOR_PALETTE = [
  '#64ebd7',
  '#18bf6e',
  '#ebd214',
  '#45f6ba',
  '#f8c6fc',
  '#2589cd',
  '#dff4ff',
  '#0f0c1c',
  '#103664',
  '#4068a5',
  '#fe1a0e',
];

const logger = getLogger('ActivityColorServiceImpl');

/**
 * アプリにアクティビティの色を割り当てるサービス
 *
 * アプリには1つの色を割り当てるようにして、常に同じ色で表示されるようにする。
 * 色管理のために
 */
@injectable()
export class ActivityColorServiceImpl implements IActivityColorService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<ActivityColor>,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'id', unique: true },
      { fieldName: 'appPath', unique: true },
    ]);
  }

  get tableName(): string {
    return 'activityColor.db';
  }

  async generateColor(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug('generateColor');
    const count = await this.dataSource.count(this.tableName, {});
    if (logger.isDebugEnabled()) logger.debug('count', count);
    return COLOR_PALETTE[count % COLOR_PALETTE.length];
  }

  async get(appPath: string): Promise<ActivityColor | null> {
    return await this.dataSource.get(this.tableName, { appPath: appPath });
  }

  async create(appPath: string): Promise<ActivityColor> {
    return {
      id: this.dataSource.generateUniqueId(),
      appPath: appPath,
      appColor: await this.generateColor(),
      updated: this.dateUtil.getCurrentDate(),
    };
  }

  async getOrCreate(appPath: string): Promise<ActivityColor> {
    let data = await this.get(appPath);
    if (!data) {
      data = await this.create(appPath);
    } else {
      if (logger.isDebugEnabled()) logger.debug('found', data);
    }
    return data;
  }

  async save(data: ActivityColor): Promise<ActivityColor> {
    if (logger.isDebugEnabled()) logger.debug('save', data);
    data.updated = this.dateUtil.getCurrentDate();
    return await this.dataSource.upsert(this.tableName, data);
  }
}
