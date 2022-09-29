import React from 'react';
import Textarea from 'react-textarea-autosize';

import type { CmsWidgetControlProps } from '../../interface';

const TextControl = ({
  forID,
  value = '',
  onChange,
  classNameWrapper,
  setActiveStyle,
  setInactiveStyle,
}: CmsWidgetControlProps<string>) => {
  return (
    <Textarea
      id={forID}
      value={value || ''}
      className={classNameWrapper}
      onFocus={setActiveStyle}
      onBlur={setInactiveStyle}
      minRows={5}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default TextControl;
