import { injectable } from 'inversify';

@injectable()
export class DateUtil {
  getCurrentDate(): Date {
    return new Date();
  }
}
