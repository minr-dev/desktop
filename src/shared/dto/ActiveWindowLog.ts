export const SYSTEM_IDLE_PID = '__system_idle__';
export const SYSTEM_IDLE_BASENAME = 'unknown';

export interface ActiveWindowLog {
  id: string;
  basename: string;
  pid: string;
  windowTitle: string;
  path?: string | null;
  activated: Date;
  deactivated: Date;
}
