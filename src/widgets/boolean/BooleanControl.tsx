import React from 'react';

import { Toggle } from '../../ui-default';

import type { CmsWidgetControlProps } from '../../core';

export default class BooleanControl extends React.Component<CmsWidgetControlProps<boolean>> {
  render() {
    const {
      value = false,
      forID,
      onChange,
      classNameWrapper,
      setActiveStyle,
      setInactiveStyle,
    } = this.props;
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
  }
}
