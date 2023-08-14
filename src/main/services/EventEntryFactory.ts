import { v4 as uuidv4 } from 'uuid';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { ExternalEventEntry } from '@shared/dto/ExternalEventEntry';

export class EventEntryFactory {
  static create(overlaps: Omit<EventEntry, 'id' | 'updated'>): EventEntry {
    const updated = new Date();
    return {
      id: uuidv4(),
      lastSynced: updated,
      updated: updated,
      ...overlaps,
    };
  }

  static createFromExternal(external: ExternalEventEntry): EventEntry {
    return EventEntryFactory.create({
      eventType: EVENT_TYPE.PLAN, // TODO: 他カレンダーのイベントの場合は、どうするか？
      summary: external.summary,
      start: external.start,
      end: external.end,
      description: external.description,
      location: external.location,
      externalEventEntryId: external.id,
      lastSynced: external.updated,
    });
  }

  static updateFromExternal(minrEvent: EventEntry, external: ExternalEventEntry): void {
    minrEvent.summary = external.summary;
    minrEvent.start = external.start;
    minrEvent.end = external.end;
    minrEvent.description = external.description;
    minrEvent.location = external.location;
    minrEvent.externalEventEntryId = external.id;
    minrEvent.lastSynced = external.updated;
  }

  static updateLogicalDelete(minrEvent: EventEntry): void {
    const deleted = new Date();
    minrEvent.lastSynced = deleted;
    minrEvent.deleted = deleted;
  }
}
