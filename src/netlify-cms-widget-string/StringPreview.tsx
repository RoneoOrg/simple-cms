import React from 'react';
import { WidgetPreviewContainer } from '../netlify-cms-ui-default';

import type { CmsWidgetPreviewProps } from '../netlify-cms-core';

function StringPreview({ value }: CmsWidgetPreviewProps<string>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default StringPreview;
