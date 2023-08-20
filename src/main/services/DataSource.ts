import Datastore from 'nedb';
import path from 'path';
import { app } from 'electron';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

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

  getPath(dbanem: string): string {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'minr' : 'minr-dev';
    const filepath = path.join(userDataPath, baseDir, dbanem);
    console.log(`db ${dbanem} path: ${filepath}`);
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
      ds.findOne<T>(query, (err, doc) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(doc);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async find(dbname: string, query: any, sort: any = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const ds = this.getDb(dbname);
      ds.find<T>(query)
        .sort(sort)
        .exec((err, docs) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(docs);
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
      ds.insert(data, (err, affectedDocuments: unknown) => {
        if (err) {
          console.error(err, data);
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
}
