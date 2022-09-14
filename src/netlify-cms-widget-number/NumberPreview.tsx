import { WidgetPreviewContainer } from '../netlify-cms-ui-default';
import React from 'react';

import type { CmsWidgetPreviewProps } from '../netlify-cms-core';

function NumberPreview({ value }: CmsWidgetPreviewProps<string | number>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default NumberPreview;
