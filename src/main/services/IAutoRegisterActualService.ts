export interface IActualAutoRegistrationService {
  autoRegisterProvisionalActuals(targetDate: Date): Promise<void>;
  confirmActualRegistration(targetDate: Date): Promise<void>;
  deleteProvisionalActuals(targetDate: Date): Promise<void>;
}
