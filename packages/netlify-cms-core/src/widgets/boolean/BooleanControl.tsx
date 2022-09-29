import React from 'react';

import { Toggle } from '../../ui';

import type { CmsWidgetControlProps } from '../../interface';

const BooleanControl = ({
  value = false,
  forID,
  onChange,
  classNameWrapper,
  setActiveStyle,
  setInactiveStyle,
}: CmsWidgetControlProps<boolean>) => {
  return (
    <div className={classNameWrapper}>
      <Toggle
        id={forID}
        active={value}
        onChange={onChange}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    </div>
  );
};

export default BooleanControl;
