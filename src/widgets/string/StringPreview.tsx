import React from 'react';
import type { CmsWidgetPreviewProps } from '../../core';
import { WidgetPreviewContainer } from '../../ui-default';

function StringPreview({ value }: CmsWidgetPreviewProps<string>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default StringPreview;
