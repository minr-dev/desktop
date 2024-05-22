import { INotificationService } from './INotificationService';
import { injectable } from 'inversify';

@injectable()
export class NotificationServiceImpl implements INotificationService {
  notify(title: string, closeMs: number): void {
    if (Notification.permission != 'granted') {
      return;
    }
    const notification = new Notification(title);
    setTimeout(() => {
      notification.close();
    }, closeMs);
  }
}
