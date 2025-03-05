export interface IActualPredictiveCreationFromPlanService {
  generatePredictedActual(start: Date, end: Date): Promise<void>;
}
