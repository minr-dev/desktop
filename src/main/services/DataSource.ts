import Datastore from 'nedb';
import path from 'path';
import { app } from 'electron';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class DataSource<T> {
  private db: Map<string, Datastore> = new Map();

  initDb(dbname: string, options?: Datastore.EnsureIndexOptions[]): Datastore {
    if (this.db.has(dbname)) {
      return this.db.get(dbname)!;
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

  private getPath(dbanem: string): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'minr', dbanem);
  }

  generateUniqueId(): string {
    return uuidv4();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(dbname: string, query: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const ds = this.initDb(dbname);
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
  async find(dbname: string, query: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const ds = this.initDb(dbname);
      ds.find<T>(query, (err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(docs);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async save(dbname: string, query: any, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const ds = this.initDb(dbname);
      ds.update(
        query,
        data,
        { upsert: true, returnUpdatedDocs: true },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err, _numAffected, _upsert) => {
          if (err) {
            reject(err);
            return;
          }
          ds.findOne(query, (err, doc) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(doc);
          });
        }
      );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(dbname: string, query: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const ds = this.initDb(dbname);
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
