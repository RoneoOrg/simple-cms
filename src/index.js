import createReactClass from 'create-react-class';
import React from 'react';
import { NetlifyCmsApp as CMS } from './netlify-cms-app';

/**
 * Add extension hooks to global scope.
 */
if (typeof window !== 'undefined') {
  window.CMS = CMS;
  window.initCMS = CMS.init;
  window.createClass = window.createClass || createReactClass;
  window.h = window.h || React.createElement;
  /**
   * Log the version number.
   */
  if (typeof NETLIFY_CMS_VERSION === 'string') {
    console.log(`netlify-cms ${NETLIFY_CMS_VERSION}`);
  }
}

export const NetlifyCms = {
  ...CMS,
};
export default CMS;
