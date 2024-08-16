import { v4 as uuidv4 } from 'uuid';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';
import { isBlank } from '@shared/utils/StrUtil';

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
      isProvisional: false,
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
    minrEvent.deleted = deleted;
    if (minrEvent.externalEventEntryId) {
      minrEvent.lastSynced = deleted;
    }
  }

  static validate(minrEvent: EventEntry): void {
    if (isBlank(minrEvent.id)) {
      throw new Error('id is blank');
    }
    if (isBlank(minrEvent.userId)) {
      throw new Error('userId is blank');
    }
    if (isBlank(minrEvent.eventType)) {
      throw new Error('eventType is blank');
    }
    if (isBlank(minrEvent.summary)) {
      throw new Error('summary is blank');
    }
    if (!minrEvent.start.date && !minrEvent.start.dateTime) {
      throw new Error('start is empty');
    }
    if (minrEvent.start.dateTime) {
      if (!minrEvent.end.dateTime) {
        throw new Error('end is empty');
      }
      if (minrEvent.start.dateTime.getTime() >= minrEvent.end.dateTime.getTime()) {
        throw new Error('start is after end');
      }
    }
    if (!minrEvent.updated) {
      throw new Error('updated is empty');
    }
  }
}
