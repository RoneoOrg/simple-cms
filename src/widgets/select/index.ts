import type { CmsWidgetParam } from '../../core';
import schema from './schema';
import controlComponent from './SelectControl';
import previewComponent from './SelectPreview';

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
