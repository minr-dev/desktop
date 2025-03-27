import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

export interface PlanAutoRegistrationParams {
  targetDate: Date;
  taskExtraHours?: Map<string, number>;
  projectId?: string;
}

export interface IPlanAutoRegistrationService {
  autoRegisterProvisional(params: PlanAutoRegistrationParams): Promise<PlanAutoRegistrationResult>;
  confirmRegistration(params: PlanAutoRegistrationParams): Promise<void>;
  deleteProvisional(params: PlanAutoRegistrationParams): Promise<void>;
}
