import { DataSource } from '../DataSource';
import * as fs from 'fs';
import * as path from 'path';

export class TestDataSource<T> extends DataSource<T> {
  getPath(dbanem: string): string {
    console.log('process.cwd', process.cwd());
    const userDataPath = path.join(process.cwd(), '.test');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const filepath = path.join(userDataPath, dbanem);
    console.log(`db ${dbanem} path: ${filepath}`);
    return filepath;
  }
}
