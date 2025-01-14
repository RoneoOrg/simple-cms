import React from 'react';
import PropTypes from 'prop-types';

import { WidgetPreviewContainer } from '../../ui';

function RelationPreview({ value }) {
  return <WidgetPreviewContainer>{value}</WidgetPreviewContainer>;
}

RelationPreview.propTypes = {
  value: PropTypes.node,
};

export default RelationPreview;
