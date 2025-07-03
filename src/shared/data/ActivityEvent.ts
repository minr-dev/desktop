export interface ActivityEvent {
  id: string;
  basename: string;
  start: Date;
  end: Date;
  details: ActivityDetail[];
  appColor: string | null;
}

export interface ActivityDetail {
  id: string;
  windowTitle: string;
  start: Date;
  end: Date;
}
