import { CmsWidgetParam } from '../../core';
import controlComponent from './RelationControl';
import previewComponent from './RelationPreview';
import schema from './schema';

function Widget(opts = {}): CmsWidgetParam {
  return {
    name: 'relation',
    controlComponent,
    previewComponent,
    schema,
    ...opts,
  };
}

export const NetlifyCmsWidgetRelation = { Widget, controlComponent, previewComponent };
export default NetlifyCmsWidgetRelation;
