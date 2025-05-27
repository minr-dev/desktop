export interface IPlanTemplateApplyProxy {
  applyTemplate(targetDate: Date, templateId: string): Promise<void>;
}
