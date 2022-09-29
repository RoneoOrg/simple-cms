import React from 'react';

import { WidgetPreviewContainer } from '../../ui';

import type { CmsWidgetPreviewProps } from '../../interface';

function ColorPreview({ value }: CmsWidgetPreviewProps<string>) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

export default ColorPreview;
