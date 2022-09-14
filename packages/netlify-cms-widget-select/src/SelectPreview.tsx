import { WidgetPreviewContainer } from 'netlify-cms-ui-default';
import React from 'react';

import type { List } from 'immutable';
import type { CmsWidgetPreviewProps } from 'netlify-cms-core';

interface ListPreviewProps {
  values: List<string>;
}

function ListPreview({ values }: ListPreviewProps) {
  return (
    <ul>
      {(values.toJS() as string[]).map((value, idx) => (
        <li key={idx}>{value}</li>
      ))}
    </ul>
  );
}

function SelectPreview({ value }: CmsWidgetPreviewProps<string | List<string> | null>) {
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
