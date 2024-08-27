export interface IDesktopNotificationService {
  sendDesktopNotification(title: string, closeMs: number): void;
}
