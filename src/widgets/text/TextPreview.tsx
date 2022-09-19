import React from 'react';
import type { CmsWidgetPreviewProps } from '../../core';
import { WidgetPreviewContainer } from '../../ui-default';

function TextPreview({ value }: CmsWidgetPreviewProps<string>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default TextPreview;
