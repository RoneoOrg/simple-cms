import styled from '@emotion/styled';
import React from 'react';

import { isList } from '../../lib/util/immutable.util';
import { WidgetPreviewContainer } from '../../ui';

import type { List, Map } from 'immutable';
import type { CmsWidgetPreviewProps, GetAssetFunction } from '../../interface';

interface StyledImageProps {
  src?: string;
}

const StyledImage = styled(({ src }: StyledImageProps) => (
  <img src={src || ''} role="presentation" />
))`
  display: block;
  max-width: 100%;
  height: auto;
`;

interface StyledImageAssetProps {
  getAsset: GetAssetFunction;
  value: string;
  field: Map<string, any>;
}

function StyledImageAsset({ getAsset, value, field }: StyledImageAssetProps) {
  return <StyledImage src={getAsset(value, field)?.url ?? ''} />;
}

interface ImagePreviewContentProps {
  getAsset: GetAssetFunction;
  value: string | string[] | List<string>;
  field: Map<string, any>;
}

const ImagePreviewContent = ({ value, getAsset, field }: ImagePreviewContentProps) => {
  if (Array.isArray(value) || isList(value)) {
    return (
      <>
        {value.map(val => (
          <StyledImageAsset key={val} value={val ?? ''} getAsset={getAsset} field={field} />
        ))}
      </>
    );
  }
  return <StyledImageAsset value={value} getAsset={getAsset} field={field} />;
};

function ImagePreview({
  value,
  getAsset,
  field,
}: CmsWidgetPreviewProps<string | string[] | List<string> | null>) {
  return (
    <WidgetPreviewContainer>
      {value ? <ImagePreviewContent value={value} getAsset={getAsset} field={field} /> : null}
    </WidgetPreviewContainer>
  );
}

export default ImagePreview;
