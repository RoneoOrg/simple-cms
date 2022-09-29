import controlComponent from './BooleanControl';

import type { CmsWidgetParam } from '../../interface';

function Widget(opts = {}): CmsWidgetParam<boolean> {
  return {
    name: 'boolean',
    controlComponent,
    ...opts,
  };
}

export const NetlifyCmsWidgetBoolean = { Widget, controlComponent };
export default NetlifyCmsWidgetBoolean;
