import React from 'react';
import rendererContainer from './inversify.config';
import { ILoggerFactory } from './services/ILoggerFactory';

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('wdyr');

if (process.env.NODE_ENV !== 'production') {
  // import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
  //   whyDidYouRender.default(React, {
  //     trackAllPureComponents: true,
  //     // trackExtraHooks: [[require('react-redux'), 'useSelector']],
  //   });
  // });
  if (logger.isDebugEnabled()) logger.debug(`React.version: ${React.version}`);
}
