import controlComponent from './SelectControl';
import previewComponent from './SelectPreview';
import schema from './schema';

import type { CmsWidgetParam } from '../netlify-cms-core';

function Widget(opts = {}): CmsWidgetParam {
  return {
    name: 'select',
    controlComponent,
    previewComponent,
    schema,
    ...opts,
  };
}

export const NetlifyCmsWidgetSelect = { Widget, controlComponent, previewComponent };
export default NetlifyCmsWidgetSelect;
