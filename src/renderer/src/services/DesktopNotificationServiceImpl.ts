import { IDesktopNotificationService } from './IDesktopNotificationService';
import { injectable } from 'inversify';

@injectable()
export class DesktopNotificationServiceImpl implements IDesktopNotificationService {
  sendDesktopNotification(title: string, closeMs: number): void {
    if (Notification.permission != 'granted') {
      return;
    }
    const notification = new Notification(title);
    setTimeout(() => {
      notification.close();
    }, closeMs);
  }
}
