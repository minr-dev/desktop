import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

export interface PlanAutoRegistrationParams {
  targetDate: Date;
  projectId?: string;
  taskExtraHours?: Map<string, number>;
}

export interface IPlanAutoRegistrationProxy {
  autoRegisterProvisonal(params: PlanAutoRegistrationParams): Promise<PlanAutoRegistrationResult>;
  confirmRegistration(targetDate: Date): Promise<void>;
  deleteProvisional(targetDate: Date): Promise<void>;
}
