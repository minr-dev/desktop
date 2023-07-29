export interface ActiveWindowLog {
  id: string;
  basename: string;
  pid: string;
  title: string;
  path: string;
  activated: Date;
  deactivated?: Date | null;
}
