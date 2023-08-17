import { EVENT_TYPE } from './EventEntry';

export interface CalendarSetting {
  calendarId: string;
  eventType: EVENT_TYPE;
  announce: boolean;
  announceTimeOffset: number;
  announceTextTemplate: string;
  muteWhileInMeeting: boolean;
}
