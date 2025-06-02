export interface IPlanTemplateApplyService {
  applyTemplate(targetDate: Date, templateId: string): Promise<void>;
}
