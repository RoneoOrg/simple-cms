import { CmsWidgetParam } from '../../core';
import controlComponent from './TextControl';
import previewComponent from './TextPreview';

function Widget(opts = {}): CmsWidgetParam {
  return {
    name: 'text',
    controlComponent,
    previewComponent,
    ...opts,
  };
}

export const NetlifyCmsWidgetText = { Widget, controlComponent, previewComponent };
export default NetlifyCmsWidgetText;
