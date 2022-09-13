import React from 'react';
import TextField from '@mui/material/TextField';

interface TextControlProps {
  onChange: (value: string) => void;
  forID?: string;
  value?: string;
  classNameWrapper: string;
  setActiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setInactiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export default class TextControl extends React.Component<TextControlProps> {
  /**
   * Always update to ensure `react-textarea-autosize` properly calculates
   * height. Certain situations, such as this widget being nested in a list
   * item that gets rearranged, can leave the textarea in a minimal height
   * state. Always updating this particular widget should generally be low cost,
   * but this should be optimized in the future.
   */
  shouldComponentUpdate() {
    return true;
  }

  render() {
    const { forID, value = '', onChange, setActiveStyle, setInactiveStyle } =
      this.props;

    return (
      <TextField
        id={forID}
        variant="outlined"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        multiline
        minRows={4}
        fullWidth
        sx={{
          '.MuiInputBase-root': {
            borderTopLeftRadius: 0,
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: '#dfdfe3',
            },
            '&:not(.Mui-focused):hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#dfdfe3',
            },
          },
        }}
      />
    );
  }
}
