import { EventEntry } from '@shared/dto/EventEntry';
import { ExternalEventEntry } from '@shared/dto/ExternalEventEntry';

export class ExternalEventEntryFactory {
  static create(overlaps: Partial<ExternalEventEntry>): ExternalEventEntry {
    if (!overlaps.summary) {
      throw new Error('summary is required');
    }
    if (!overlaps.start) {
      throw new Error('summary is required');
    }
    if (!overlaps.end) {
      throw new Error('summary is required');
    }
    return {
      summary: overlaps.summary,
      start: overlaps.start,
      end: overlaps.end,
      ...overlaps,
    };
  }

  static createFromMinr(minr: EventEntry): ExternalEventEntry {
    return ExternalEventEntryFactory.create({
      summary: minr.summary,
      start: minr.start,
      end: minr.end,
      description: minr.description,
      location: minr.location,
    });
  }

  static updateFromMinr(external: ExternalEventEntry, minr: EventEntry): void {
    external.summary = minr.summary;
    external.start = minr.start;
    external.end = minr.end;
    external.description = minr.description;
    external.location = minr.location;
  }
}
