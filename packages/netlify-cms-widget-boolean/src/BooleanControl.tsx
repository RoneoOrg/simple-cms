import { Toggle } from 'netlify-cms-ui-default';
import React from 'react';

interface BooleanControlProps {
  onChange: (value: boolean) => void;
  forID?: string;
  value?: boolean;
  classNameWrapper: string;
  setActiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setInactiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export default class BooleanControl extends React.Component<BooleanControlProps> {
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
