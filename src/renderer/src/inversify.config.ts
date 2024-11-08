import 'reflect-metadata';
// ※ container の読み込み順
// rendererContainer (inversify.config.ts) に bind されるモジュールが、ロガーを使っている関係で
// ロガーに関連するモジュールを loggerContainer (inversify.logger.config) に分離して、
// rendererContainer よりも先に初期化させる。
// ここでは、 loggerContainer を初期化のためにインポートだけしている
import loggerContainer from './inversify.logger.config';
import rendererContainer from './inversify.renderer.config';

export { loggerContainer };
export default rendererContainer;
