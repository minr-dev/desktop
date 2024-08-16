export interface Application {
  id: string;

  basename: string;
  relatedProjectId: string;
  relatedCategoryId: string;
  relatedLabelIds: string[];

  updated: Date;
}
