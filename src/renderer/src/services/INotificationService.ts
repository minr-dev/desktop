export interface INotificationService {
  notify(title: string, closeMs: number): void;
}
