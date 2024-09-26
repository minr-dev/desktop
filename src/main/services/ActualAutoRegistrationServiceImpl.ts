import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IActualAutoRegistrationService } from './IAutoRegisterActualService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { addDays, addHours } from 'date-fns';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import type { IOverlapEventMergeService } from './IOverlapEventMergeService';
import type { IActualBuilderService } from './IActualBuilderService';
import type { IActualAutoRegistrationFinalizerService } from './IActualAutoRegistrationFinalizerService';

@injectable()
export class ActualAutoRegistrationServiceImpl implements IActualAutoRegistrationService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.ActualBuilderService)
    private readonly actualBuilderService: IActualBuilderService,
    @inject(TYPES.OverlapEventMergeService)
    private readonly overlapEventMergeService: IOverlapEventMergeService,
    @inject(TYPES.ActualAutoRegistrationFinalizerService)
    private readonly actualAutoRegistrationFinalizerService: IActualAutoRegistrationFinalizerService
  ) {}

  async autoRegisterProvisionalActuals(targetDate: Date): Promise<void> {
    const buildActualPromises = Array.from({ length: 24 }).map((_, hour) => {
      const start = addHours(targetDate, hour);
      const end = addHours(start, 1);
      return this.actualBuilderService.buildActual(start, end);
    });

    const actualsBeforeMerge = await Promise.all(buildActualPromises).then((actuals) =>
      actuals.filter((actual): actual is EventEntry => actual != null)
    );

    const mergedActuals = this.overlapEventMergeService.mergeOverlapEvent(actualsBeforeMerge);

    await this.actualAutoRegistrationFinalizerService.finalizeRegistration(mergedActuals);
  }

  private async getProvisionalActuals(targetDate: Date): Promise<EventEntry[]> {
    const userId = await this.userDetailsService.getUserId();
    const start = targetDate;
    const end = addDays(start, 1);
    const eventEntries = await this.eventEntryService.list(userId, start, end);
    return eventEntries
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
      .filter((event) => event.isProvisional);
  }

  /**
   * 1日分の仮実績を全て本登録状態にする
   *
   * @param targetDate
   */
  async confirmActualRegistration(targetDate: Date): Promise<void> {
    const provisionalActuals = await this.getProvisionalActuals(targetDate);
    Promise.all(
      provisionalActuals.map((provisionalActual) =>
        this.eventEntryService.save({ ...provisionalActual, isProvisional: false })
      )
    );
  }

  /**
   * 1日分の仮実績を全て削除する
   *
   * @param targetDate
   */
  async deleteProvisionalActuals(targetDate: Date): Promise<void> {
    const provisionalActuals = await this.getProvisionalActuals(targetDate);
    Promise.all(
      provisionalActuals.map((provisionalActual) =>
        this.eventEntryService.delete(provisionalActual.id)
      )
    );
  }
}
