import controlComponent from './StringControl';
import previewComponent from './StringPreview';

import type { CmsWidgetParam } from 'netlify-cms-core';

function Widget(opts = {}): CmsWidgetParam {
  return {
    name: 'string',
    controlComponent,
    previewComponent,
    ...opts,
  };
}

export const NetlifyCmsWidgetString = { Widget, controlComponent, previewComponent };
export default NetlifyCmsWidgetString;
