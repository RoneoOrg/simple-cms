import React from 'react';
import type { CmsWidgetPreviewProps } from '../../core';
import { WidgetPreviewContainer } from '../../ui-default';

interface ListPreviewProps {
  values: string[];
}

function ListPreview({ values }: ListPreviewProps) {
  return (
    <ul>
      {(values as string[]).map((value, idx) => (
        <li key={idx}>{value}</li>
      ))}
    </ul>
  );
}

function SelectPreview({ value }: CmsWidgetPreviewProps<string | string[] | null>) {
  if (!value) {
    return <WidgetPreviewContainer />;
  }

  return (
    <WidgetPreviewContainer>
      {typeof value === 'string' ? value : <ListPreview values={value} />}
    </WidgetPreviewContainer>
  );
}

export default SelectPreview;
