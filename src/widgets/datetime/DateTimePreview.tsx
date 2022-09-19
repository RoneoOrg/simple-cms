import { WidgetPreviewContainer } from '../../ui-default';
import React from 'react';

import type { CmsWidgetPreviewProps } from '../../core';

function DatePreview({ value }: CmsWidgetPreviewProps<string | Date>) {
  return <WidgetPreviewContainer>{value ? value.toString() : null}</WidgetPreviewContainer>;
}

export default DatePreview;