import withFileControl from './withFileControl';
import previewComponent from './FilePreview';
import schema from './schema';

import type { CmsWidgetParam } from '../../interface';
import type { List } from 'immutable';

const controlComponent = withFileControl();

function Widget(opts = {}): CmsWidgetParam<string | string[] | List<string> | null> {
  return {
    name: 'file',
    controlComponent,
    previewComponent,
    schema,
    ...opts,
  };
}

export const NetlifyCmsWidgetFile = { Widget, controlComponent, previewComponent, withFileControl };
export default NetlifyCmsWidgetFile;
