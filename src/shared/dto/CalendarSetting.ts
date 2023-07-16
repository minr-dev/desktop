import { CalendarType } from './CalendarType';

export interface CalendarSetting {
  calendarId: string;
  type: CalendarType;
  announce: boolean;
  announceTimeOffset: number;
  announceTextTemplate: string;
  muteWhileInMeeting: boolean;
}
