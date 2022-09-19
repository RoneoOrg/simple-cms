import React from 'react';
import PropTypes from 'prop-types';
import { isString } from 'lodash';
import { WidgetPreviewContainer } from '../../ui-default';

function toValue(value, field) {
  if (isString(value)) {
    return value;
  }
  if (typeof value === 'object') {
    return value[field.keys.code ?? 'code'] ?? '';
  }
  return '';
}

function CodePreview(props) {
  return (
    <WidgetPreviewContainer>
      <pre>
        <code>{toValue(props.value, props.field)}</code>
      </pre>
    </WidgetPreviewContainer>
  );
}

CodePreview.propTypes = {
  value: PropTypes.node,
};

export default CodePreview;
