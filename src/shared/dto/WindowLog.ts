export const SYSTEM_IDLE_PID = '__system_idle__';
export const SYSTEM_IDLE_BASENAME = 'unknown';

/**
 * アクティブなWindowの情報
 *
 * OS がアイドル状態（一定時間、無操作状態が続いた状態）に以降するときに、
 * アイドル状態を示す WindowLog を作成する。
 * アイドル状態から復帰したときには、そのときのアクティブなWindowでWindowLog が作成される。
 *
 * （例）
 * 通常 -> アイドル -> 通常 と状態が遷移したときには、次のように WindowLog が作成される。
 *
 * {
 *  id: '1',
 *  basename: 'app1.exe',
 *  pid: '1234',
 *  windowTitle: 'app1.exe - Awesome application',
 *  path: 'C:\Program Files\app1\app1.exe',
 *  activated: '2020-01-01T00:00:00.000Z',
 *  deactivated: '2020-01-01T00:10:00.000Z',
 * }
 * {
 *  id: '2',
 *  basename: 'unknown',
 *  pid: '__system_idle__',
 *  windowTitle: '__system_idle__',
 *  path: null,
 *  activated: '2020-01-01T00:10:00.000Z',
 *  deactivated: '2020-01-01T00:20:00.000Z',
 * }
 * {
 *  id: '3',
 *  basename: 'app1.exe',
 *  pid: '1234',
 *  windowTitle: 'app1.exe - Awesome application',
 *  path: 'C:\Program Files\app1\app1.exe',
 *  activated: '2020-01-01T00:20:00.000Z',
 *  deactivated: '2020-01-01T00:30:00.000Z',
 * }
 */
export interface WindowLog {
  id: string;
  basename: string;
  pid: string;
  windowTitle: string;
  path?: string | null;
  activated: Date;
  deactivated: Date;
}
