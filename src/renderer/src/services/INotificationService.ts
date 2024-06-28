export interface INotificationService {
  sendNotification(title: string, closeMs: number): void;
}
