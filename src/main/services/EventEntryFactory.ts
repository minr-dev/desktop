import { v4 as uuidv4 } from 'uuid';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';

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

  static createFromExternal(
    userId: string,
    eventType: EVENT_TYPE,
    external: ExternalEventEntry
  ): EventEntry {
    return EventEntryFactory.create({
      userId: userId,
      eventType: eventType,
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
