import { injectable } from 'inversify';

@injectable()
export class SpeakTextGenerator {
  timeToText(time: Date): string {
    const hour = `${time.getHours()}時`;
    let minute;
    if (time.getMinutes() === 0) {
      minute = '';
    } else if (time.getMinutes() === 30) {
      minute = '半';
    } else {
      minute = time.getMinutes() + '分';
    }
    return `${hour}${minute}`;
  }

  timeSignalText(template: string, time: Date): string {
    return template.replace('{TIME}', this.timeToText(time));
  }
}
