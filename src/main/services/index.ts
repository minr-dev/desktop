import { StoreUserPreferenceServiceImpl } from './StoreUserPreferenceServiceImpl';
import { GoogleAuthServiceImpl } from './GoogleAuthServiceImpl';
import { StoreGoogleCredentialsServiceImpl } from './StoreGoogleCredentialsServiceImpl';
import { GoogleCalendarServiceImpl } from './GoogleCalendarServiceImpl';

const handlers = [
  new StoreUserPreferenceServiceImpl(), //
  new StoreGoogleCredentialsServiceImpl(), //
  new GoogleAuthServiceImpl(), //
  new GoogleCalendarServiceImpl(), //
];

const initIpcHandlers = (): void => {
  for (const handler of handlers) {
    handler.init();
  }
};

export default initIpcHandlers;
