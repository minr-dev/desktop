import { StoreUserPreferenceServiceImpl } from './StoreUserPreferenceServiceImpl';
import { GoogleAuthServiceImpl } from './GoogleAuthServiceImpl';
import { StoreGoogleCredentialsServiceImpl } from './StoreGoogleCredentialsServiceImpl';

const handlers = [
  new StoreUserPreferenceServiceImpl(), //
  new StoreGoogleCredentialsServiceImpl(), //
  new GoogleAuthServiceImpl(), //
];

const initIpcHandlers = (): void => {
  for (const handler of handlers) {
    handler.init();
  }
};

export default initIpcHandlers;
