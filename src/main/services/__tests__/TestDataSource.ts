import { getLogger } from '@main/utils/LoggerUtil';
import { DataSource } from '../DataSource';
import * as fs from 'fs';
import { injectable } from 'inversify';
import * as path from 'path';

const logger = getLogger('TestDataSource');

@injectable()
export class TestDataSource<T> extends DataSource<T> {
  getPath(dbname: string): string {
    if (logger.isDebugEnabled()) logger.debug('process.cwd', process.cwd());
    const userDataPath = path.join(process.cwd(), '.test');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const filepath = path.join(userDataPath, dbname);
    if (logger.isDebugEnabled()) logger.debug(`db ${dbname} path: ${filepath}`);
    return filepath;
  }
}
