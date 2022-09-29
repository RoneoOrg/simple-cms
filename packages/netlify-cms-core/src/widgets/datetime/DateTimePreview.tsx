import React from 'react';

import { WidgetPreviewContainer } from '../../ui';

import type { CmsWidgetPreviewProps } from '../../interface';

function DatePreview({ value }: CmsWidgetPreviewProps<string | Date>) {
  return <WidgetPreviewContainer>{value ? value.toString() : null}</WidgetPreviewContainer>;
}

export default DatePreview;
