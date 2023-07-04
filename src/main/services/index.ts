import { StoreUserPreferenceServiceImpl } from './StoreUserPreferenceServiceImpl';
import { GoogleAuthServiceImpl } from './GoogleAuthServiceImpl';

const handlers = [
  new StoreUserPreferenceServiceImpl(), //
  new GoogleAuthServiceImpl(), //
];

const initIpcHandlers = (): void => {
  for (const handler of handlers) {
    handler.init();
  }
};

export default initIpcHandlers;
