export interface IPlanTemplateApplicationService {
  applyTemplate(targetDate: Date, templateId: string): Promise<void>;
}
