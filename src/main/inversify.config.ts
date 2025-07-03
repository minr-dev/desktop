import 'reflect-metadata';
// ※ container の読み込み順
// mainContainer (inversify.config.ts) に bind されるモジュールが、ロガーを使っている関係で
// ロガーに関連するモジュールを loggerContainer (inversify.logger.config) に分離して、
// mainContainer よりも先に初期化させる。
// ここでは、 loggerContainer を初期化のためにインポートだけしている
import loggerContainer from './inversify.logger.config';
import mainContainer from './inversify.main.config';

export { loggerContainer };
export default mainContainer;
