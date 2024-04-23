import { DataSource } from '../DataSource';
import * as fs from 'fs';
import { injectable } from 'inversify';
import * as path from 'path';

@injectable()
export class TestDataSource<T> extends DataSource<T> {
  getPath(dbname: string): string {
    console.log('process.cwd', process.cwd());
    const userDataPath = path.join(process.cwd(), '.test');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const filepath = path.join(userDataPath, dbname);
    console.log(`db ${dbname} path: ${filepath}`);
    return filepath;
  }
}
