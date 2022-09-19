import { WidgetPreviewContainer } from '../../ui-default';
import React from 'react';

import type { CmsWidgetPreviewProps } from '../../core';

function NumberPreview({ value }: CmsWidgetPreviewProps<string | number>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default NumberPreview;
