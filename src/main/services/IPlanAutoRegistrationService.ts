import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

export interface PlanAutoRegistrationParams {
  targetDate: Date;
  taskExtraHours?: Map<string, number>;
  projectId?: string;
}

export interface IPlanAutoRegistrationService {
  autoRegisterProvisional(params: PlanAutoRegistrationParams): Promise<PlanAutoRegistrationResult>;
  confirmRegistration(targetDate: Date): Promise<void>;
  deleteProvisional(targetDate: Date): Promise<void>;
}
