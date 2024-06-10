import { PomodoroNotificationSetting } from '../PomodoroNotificationSetting';

export class PomodoroNotificationSettingFixture {
  static default(override: Partial<PomodoroNotificationSetting> = {}): PomodoroNotificationSetting {
    return {
      announce: true,
      sendNotification: true,
      template: '',
      ...override,
    };
  }
}
