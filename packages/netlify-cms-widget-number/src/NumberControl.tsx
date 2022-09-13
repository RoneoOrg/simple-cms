/* eslint-disable @typescript-eslint/no-explicit-any */
import TextField from '@mui/material/TextField';
import React from 'react';

import type { Map } from 'immutable';
import type { t } from 'react-polyglot';

const ValidationErrorTypes = {
  PRESENCE: 'PRESENCE',
  PATTERN: 'PATTERN',
  RANGE: 'RANGE',
  CUSTOM: 'CUSTOM',
};

export function validateMinMax(
  value: string | number,
  min: number | false,
  max: number | false,
  field: Map<string, any>,
  t: t,
) {
  let error;

  switch (true) {
    case value !== '' && min !== false && max !== false && (value < min || value > max):
      error = {
        type: ValidationErrorTypes.RANGE,
        message: t('editor.editorControlPane.widget.range', {
          fieldLabel: field.get('label', field.get('name')),
          minValue: min,
          maxValue: max,
        }),
      };
      break;
    case value !== '' && min !== false && value < min:
      error = {
        type: ValidationErrorTypes.RANGE,
        message: t('editor.editorControlPane.widget.min', {
          fieldLabel: field.get('label', field.get('name')),
          minValue: min,
        }),
      };
      break;
    case value !== '' && max !== false && value > max:
      error = {
        type: ValidationErrorTypes.RANGE,
        message: t('editor.editorControlPane.widget.max', {
          fieldLabel: field.get('label', field.get('name')),
          maxValue: max,
        }),
      };
      break;
    default:
      error = null;
      break;
  }

  return error;
}

interface NumberControlProps {
  field: Map<string, any>;
  onChange: (value: number | string) => void;
  classNameWrapper: string;
  setActiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setInactiveStyle: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  forID?: string;
  value?: number | string;
  valueType?: string;
  step: number;
  min: number;
  max: number;
  t: t;
}

export default class NumberControl extends React.Component<NumberControlProps> {
  static defaultProps = {
    value: '',
  };

  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    const valueType = this.props.field.get('value_type');
    const { onChange } = this.props;
    const value = valueType === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value, 10);

    if (!isNaN(value)) {
      onChange(value);
    } else {
      onChange('');
    }
  };

  isValid = () => {
    const { field, value = '', t } = this.props;
    const hasPattern = !!field.get('pattern', false);
    const min = field.get('min', false);
    const max = field.get('max', false);

    // Pattern overrides min/max logic always:
    if (hasPattern) {
      return true;
    }

    const error = validateMinMax(value, min, max, field, t);
    return error ? { error } : true;
  };

  render() {
    const { field, value = '', forID, setActiveStyle, setInactiveStyle } = this.props;
    const min: string | number = field.get('min', '');
    const max: string | number = field.get('max', '');
    const step: string | number = field.get('step', field.get('value_type') === 'int' ? 1 : '');
    return (
      <TextField
        id={forID}
        variant="outlined"
        type="number"
        value={value || (value === 0 ? value : '')}
        onChange={this.handleChange}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        inputProps={{
          step,
          min,
          max,
        }}
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
        InputLabelProps={{
          shrink: true,
        }}
      />
    );
  }
}
