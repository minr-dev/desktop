import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { eventDateTimeToDate } from '@shared/dto/EventDateTime';
import { EventEntry } from '@shared/dto/EventEntry';
import { GitHubEvent } from '@shared/dto/GitHubEvent';
import { addMinutes, differenceInMinutes } from 'date-fns';

export abstract class EventTimeCell {
  private _overlappingIndex = 0;
  private _overlappingCount = 0;

  constructor(readonly startTime: Date, readonly endTime: Date) {}

  abstract get id(): string;
  abstract get summary(): string;
  abstract copy(): EventTimeCell;

  get overlappingIndex(): number {
    return this._overlappingIndex;
  }

  set overlappingIndex(value: number) {
    this._overlappingIndex = value;
  }

  get overlappingCount(): number {
    return this._overlappingCount;
  }

  set overlappingCount(value: number) {
    this._overlappingCount = value;
  }

  get cellFrameStart(): Date {
    return this.startTime;
  }

  get cellFrameEnd(): Date {
    let mins = differenceInMinutes(this.endTime, this.startTime);
    if (mins < 15) {
      mins = 15;
      const endTime = addMinutes(this.startTime, mins);
      return endTime;
    }
    return this.endTime;
  }
}

export class EventEntryTimeCell extends EventTimeCell {
  constructor(readonly startTime: Date, readonly endTime: Date, readonly event: EventEntry) {
    super(startTime, endTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this.event.summary;
  }

  replaceStartTime(value: Date): EventEntryTimeCell {
    const event = { ...this.event, start: { dateTime: value } };
    return new EventEntryTimeCell(value, this.endTime, event);
  }

  replaceEndTime(value: Date): EventEntryTimeCell {
    const event = { ...this.event, end: { dateTime: value } };
    return new EventEntryTimeCell(this.startTime, value, event);
  }

  replaceTime(startTime: Date, endTime: Date): EventEntryTimeCell {
    const event = { ...this.event, start: { dateTime: startTime }, end: { dateTime: endTime } };
    return new EventEntryTimeCell(startTime, endTime, event);
  }

  copy(): EventEntryTimeCell {
    return new EventEntryTimeCell(this.startTime, this.endTime, this.event);
  }

  static fromEventEntry(eventEntry: EventEntry): EventEntryTimeCell {
    return new EventEntryTimeCell(
      eventDateTimeToDate(eventEntry.start),
      eventDateTimeToDate(eventEntry.end),
      eventEntry
    );
  }
}

export class ActivityEventTimeCell extends EventTimeCell {
  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: ActivityEvent) {
    super(startTime, endDateTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this.event.basename;
  }

  copy(): ActivityEventTimeCell {
    return new ActivityEventTimeCell(this.startTime, this.endDateTime, this.event);
  }

  static fromActivityEvent(event: ActivityEvent): ActivityEventTimeCell {
    return new ActivityEventTimeCell(event.start, event.end, event);
  }
}

export class GitHubEventTimeCell extends EventTimeCell {
  constructor(readonly startTime: Date, readonly endDateTime: Date, readonly event: GitHubEvent) {
    super(startTime, endDateTime);
  }

  get id(): string {
    return this.event.id;
  }

  get summary(): string {
    return this.event.type;
  }

  copy(): GitHubEventTimeCell {
    return new GitHubEventTimeCell(this.startTime, this.endDateTime, this.event);
  }

  static fromGitHubEvent(event: GitHubEvent): GitHubEventTimeCell {
    return new GitHubEventTimeCell(event.updated_at, event.updated_at, event);
  }
}
