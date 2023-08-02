export interface ActivityEvent {
  id: string;
  basename: string;
  start: Date;
  end: Date;
  details: ActivityDetail[];
}

export interface ActivityDetail {
  id: string;
  windowTitle: string;
  start: Date;
  end: Date;
}
