import { StoreUserPreferenceServiceImpl } from './StoreUserPreferenceServiceImpl';
import { GoogleAuthSearviceImpl } from './GoogleAuthSearviceImpl';

const handlers = [
  new StoreUserPreferenceServiceImpl(), //
  new GoogleAuthSearviceImpl(), //
];

const initIpcHandlers = (): void => {
  for (const handler of handlers) {
    handler.init();
  }
};

export default initIpcHandlers;
