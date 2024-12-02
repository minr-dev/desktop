import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';

export interface IPlanAutoRegistrationService {
  autoRegisterProvisional(
    targetDate: Date,
    taskAllocations?: Map<string, number>
  ): Promise<PlanAutoRegistrationResult>;
  confirmRegistration(targetDate: Date): Promise<void>;
  deleteProvisional(targetDate: Date): Promise<void>;
}
