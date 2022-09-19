import createReactClass from 'create-react-class';
import React from 'react';

import { NetlifyCmsApp as CMS } from './app';

if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

declare global {
  interface Window {
    CMS: typeof CMS;
    initCMS: typeof CMS.init;
    createCLass: typeof createReactClass;
    h: typeof React.createElement;
  }
}

/**
 * Add extension hooks to global scope.
 */
if (typeof window !== 'undefined') {
  window.CMS = CMS;
  window.initCMS = CMS.init;
  window.createCLass = window.createCLass || createReactClass;
  window.h = window.h || React.createElement;
  /**
   * Log the version number.
   */
  // if (typeof NETLIFY_CMS_VERSION === 'string') {
  //   console.log(`netlify-cms ${NETLIFY_CMS_VERSION}`);
  // }
}

export const NetlifyCms = {
  ...CMS,
};
export default CMS;
