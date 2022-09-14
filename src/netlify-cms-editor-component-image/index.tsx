import React from 'react';

import type { EditorComponentOptions } from '../netlify-cms-core';

const image: EditorComponentOptions = {
  label: 'Image',
  id: 'image',
  fromBlock: match =>
    match && {
      image: match[2],
      alt: match[1],
      title: match[4],
    },
  toBlock: ({ alt, image, title }) =>
    `![${alt || ''}](${image || ''}${title ? ` "${title.replace(/"/g, '\\"')}"` : ''})`,
  toPreview: ({ alt, image, title }, getAsset, fields) => {
    const imageField = fields?.find(f => f.get('widget') === 'image');
    const src = getAsset(image, imageField);
    return <img src={src ?? ''} alt={alt ?? ''} title={title ?? ''} />;
  },
  pattern: /^!\[(.*)\]\((.*?)(\s"(.*)")?\)$/,
  fields: [
    {
      label: 'Image',
      name: 'image',
      widget: 'image',
      media_library: {
        allow_multiple: false,
      },
    },
    {
      label: 'Alt Text',
      name: 'alt',
    },
    {
      label: 'Title',
      name: 'title',
    },
  ],
};

export const NetlifyCmsEditorComponentImage = image;
export default image;
