export interface IPlanTemplateApplicationProxy {
  applyTemplate(targetDate: Date, templateId: string): Promise<void>;
}
