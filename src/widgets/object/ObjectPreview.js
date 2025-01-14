import React from 'react';
import PropTypes from 'prop-types';

import { WidgetPreviewContainer } from '../../ui';

function ObjectPreview({ field }) {
  return (
    <WidgetPreviewContainer>
      {(field && field.get('fields')) || field.get('field') || null}
    </WidgetPreviewContainer>
  );
}

ObjectPreview.propTypes = {
  field: PropTypes.node,
};

export default ObjectPreview;
