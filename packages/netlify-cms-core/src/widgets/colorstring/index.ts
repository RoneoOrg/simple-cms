import controlComponent from './ColorControl';
import previewComponent from './ColorPreview';

import type { CmsWidgetParam } from '../../interface';

function Widget(opts = {}): CmsWidgetParam<string> {
  return {
    name: 'color',
    controlComponent,
    previewComponent,
    ...opts,
  };
}

export const NetlifyCmsWidgetColorString = { Widget, controlComponent, previewComponent };
export default NetlifyCmsWidgetColorString;
