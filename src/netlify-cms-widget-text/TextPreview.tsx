import React from 'react';
import { WidgetPreviewContainer } from '../netlify-cms-ui-default';

import type { CmsWidgetPreviewProps } from '../netlify-cms-core';

function TextPreview({ value }: CmsWidgetPreviewProps<string>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default TextPreview;
