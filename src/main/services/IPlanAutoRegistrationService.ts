import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

export interface IPlanAutoRegistrationService {
  autoRegisterProvisional(
    targetDate: Date,
    taskExtraHours?: Map<string, number>
  ): Promise<PlanAutoRegistrationResult>;
  confirmRegistration(targetDate: Date): Promise<void>;
  deleteProvisional(targetDate: Date): Promise<void>;
}
