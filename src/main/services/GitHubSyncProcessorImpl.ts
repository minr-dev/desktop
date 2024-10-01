import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { add as addDate } from 'date-fns';
import { ITaskProcessor } from './ITaskProcessor';
import type { IGitHubService } from './IGitHubService';
import { DateUtil } from '@shared/utils/DateUtil';
import type { IGitHubEventStoreService } from './IGitHubEventStoreService';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import type { ILoggerFactory } from './ILoggerFactory';

// 取得開始日を現在日から3日前
const SYNC_RANGE_START_OFFSET_DAYS = -3;

/**
 * GitHub との同期処理を実行するタスク
 *
 * v0.1.0 の時点では、GitHub からイベントを取得するだけの片方向の同期となっている
 */
@injectable()
export class GitHubSyncProcessorImpl implements ITaskProcessor {
  private logger;

  constructor(
    @inject(TYPES.GitHubService)
    private readonly gitHubService: IGitHubService,
    @inject(TYPES.GitHubEventStoreService)
    private readonly gitHubEventStoreService: IGitHubEventStoreService,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'GitHubSyncProcessorImpl',
    });
  }

  async execute(): Promise<void> {
    this.logger.info('execute');
    const now = this.dateUtil.getCurrentDate();
    const until = addDate(now, { days: SYNC_RANGE_START_OFFSET_DAYS });
    const newEvents = await this.gitHubService.fetchEvents(until);
    const ids = newEvents.map((event) => event.id);
    const existsEvents = await this.gitHubEventStoreService.findById(ids);
    const existsEventMap = new Map<string, GitHubEvent>();
    for (const event of existsEvents) {
      existsEventMap.set(event.id, event);
    }
    this.logger.info(`check new entry: ${existsEventMap}`);
    for (const event of newEvents) {
      const exists = existsEventMap.get(event.id);
      if (!exists) {
        this.logger.info(`not exists: ${event.id}`);
        await this.gitHubEventStoreService.save(event);
      } else {
        this.logger.info(`Already exists: ${event.id}`);
      }
    }
  }

  async terminate(): Promise<void> {
    return Promise.resolve();
  }
}
