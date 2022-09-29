import CmsWidgetFile from '../file';
import previewComponent from './ImagePreview';
import schema from './schema';

import type { CmsWidgetParam } from '../../interface';
import type { List } from 'immutable';

const controlComponent = CmsWidgetFile.withFileControl({ forImage: true });

function Widget(opts = {}): CmsWidgetParam<string | string[] | List<string> | null> {
  return {
    name: 'image',
    controlComponent,
    previewComponent,
    schema,
    ...opts,
  };
}

export const CmsWidgetImage = { Widget, controlComponent, previewComponent };
export default CmsWidgetImage;
