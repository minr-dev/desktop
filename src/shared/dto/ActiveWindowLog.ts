export interface ActiveWindowLog {
  id: string;
  basename: string;
  pid: string;
  windowTitle: string;
  path: string;
  activated: Date;
  deactivated: Date;
}
