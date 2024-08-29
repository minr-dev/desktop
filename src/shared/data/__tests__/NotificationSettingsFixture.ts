import { NotificationSettings } from '../NotificationSettings';

export class NotificationSettingsFixture {
  static default(override: Partial<NotificationSettings> = {}): NotificationSettings {
    return {
      useVoiceNotification: false,
      useDesktopNotification: false,
      notificationTimeOffset: 5,
      notificationTemplate: '',
      ...override,
    };
  }
}
