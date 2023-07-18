/**
 * DIコンテナの登録名
 */
export const TYPES = {
  // usecase

  // domain/service
  GoogleAuthService: Symbol.for('GoogleAuthService'),
  GoogleCalendarService: Symbol.for('GoogleCalendarService'),
  CredentialsStoreService: Symbol.for('CredentialsStoreService'),
  UserPreferenceStoreService: Symbol.for('UserPreferenceStoreService'),

  // domain/repository

  // infrastracture/electron
  IpcHandlerInitializer: Symbol.for('IpcHandlerInitializer'),
};
