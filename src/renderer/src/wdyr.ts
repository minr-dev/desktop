import React from 'react';

if (process.env.NODE_ENV !== 'production') {
  // import('@welldone-software/why-did-you-render').then((whyDidYouRender) => {
  //   whyDidYouRender.default(React, {
  //     trackAllPureComponents: true,
  //     // trackExtraHooks: [[require('react-redux'), 'useSelector']],
  //   });
  // });
  console.log('React.version', React.version);
}
