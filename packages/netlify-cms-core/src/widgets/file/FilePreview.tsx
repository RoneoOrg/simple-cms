import styled from '@emotion/styled';
import React from 'react';

import { isList } from '../../lib/util/immutable.util';
import { WidgetPreviewContainer } from '../../ui';

import type { List, Map } from 'immutable';
import type { CmsWidgetPreviewProps, GetAssetFunction } from '../../interface';

interface FileLinKProps {
  href: string;
  path: string;
}

const FileLink = styled(({ href, path }: FileLinKProps) => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    {path}
  </a>
))`
  display: block;
`;

interface FileLinkListProps {
  values: string[] | List<string>;
  getAsset: GetAssetFunction;
  field: Map<string, any>;
}

function FileLinkList({ values, getAsset, field }: FileLinkListProps) {
  return (
    <div>
      {values.map((value = '') => (
        <FileLink key={value} path={value} href={getAsset(value, field)?.url ?? ''} />
      ))}
    </div>
  );
}

function FileContent(props: CmsWidgetPreviewProps<string | string[] | List<string> | null>) {
  const { value, getAsset, field } = props;
  if (Array.isArray(value) || isList(value)) {
    return <FileLinkList values={value} getAsset={getAsset} field={field} />;
  }
  return <FileLink key={value} path={value ?? ''} href={getAsset(value ?? '', field)?.url ?? ''} />;
}

function FilePreview(props: CmsWidgetPreviewProps<string | string[] | List<string> | null>) {
  return (
    <WidgetPreviewContainer>
      {props.value ? <FileContent {...props} /> : null}
    </WidgetPreviewContainer>
  );
}

export default FilePreview;
