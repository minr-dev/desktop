import Datastore from '@seald-io/nedb';
import path from 'path';
import { app } from 'electron';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('DataSource');

@injectable()
export class DataSource<T> {
  private db: Map<string, Datastore> = new Map();

  createDb(dbname: string, options?: Datastore.EnsureIndexOptions[]): Datastore {
    if (this.db.has(dbname)) {
      throw new Error(`db ${dbname} already exists`);
    }
    const db = new Datastore({
      filename: this.getPath(dbname),
      autoload: true,
    });
    if (options) {
      for (const option of options) {
        db.ensureIndex(option);
      }
    }
    this.db.set(dbname, db);
    return db;
  }

  getDb(dbname: string): Datastore {
    const db = this.db.get(dbname);
    if (!db) {
      throw new Error(`db ${dbname} does not exists`);
    }
    return db;
  }

  getPath(dbname: string): string {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'minr' : 'minr-dev';
    const filepath = path.join(userDataPath, baseDir, dbname);
    if (logger.isDebugEnabled()) logger.debug(`db ${dbname} path: ${filepath}`);
    return filepath;
  }

  generateUniqueId(): string {
    return uuidv4();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async count(dbname: string, query: any): Promise<number> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      ds.count(query, (err, count) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(count);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(dbname: string, query: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      ds.findOne<Record<string, unknown>>(query, (err, doc) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(doc as T);
      });
    });
  }

  async find(
    dbname: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort: any = {},
    skip?: number,
    limit?: number
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      let cursor = ds.find<Record<string, unknown>>(query).sort(sort);
      if (skip) {
        cursor = cursor.skip(skip);
      }
      if (limit) {
        cursor = cursor.limit(limit);
      }
      cursor.exec((err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(docs as T[]);
      });
    });
  }

  async upsert(dbname: string, data: T & { _id?: string }): Promise<T> {
    if (data._id) {
      return await this.update(dbname, { _id: data._id }, data);
    } else {
      return await this.insert(dbname, data);
    }
  }

  async insert(dbname: string, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      ds.insert(data as Record<string, unknown>, (err, affectedDocuments: unknown) => {
        if (err) {
          logger.error(err, data);
          reject(err);
          return;
        }
        resolve(affectedDocuments as T);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(dbname: string, query: any, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      ds.update(
        query,
        { $set: data },
        { upsert: true, returnUpdatedDocs: true },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err, _numAffected, affectedDocuments: unknown) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(affectedDocuments as T);
        }
      );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(dbname: string, query: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ds.remove(query, { multi: true }, (err, _numRemoved) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  isUniqueConstraintViolated(err: unknown): boolean {
    if (
      typeof err === 'object' &&
      err !== null &&
      'errorType' in err &&
      err['errorType'] === 'uniqueViolated'
    ) {
      return true;
    }
    return false;
  }
}
