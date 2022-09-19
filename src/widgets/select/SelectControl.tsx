import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { List } from 'immutable';
import React from 'react';
import { validations } from '../../lib/widgets';
import { isList, isMap, toJS, toList } from '../../util/ImmutableUtil';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Map } from 'immutable';
import type { CmsWidgetControlProps } from '../../core';

interface Option {
  label: string;
  value: string;
}

function convertToOption(raw: string | Record<string, string> | undefined): Option | undefined {
  if (typeof raw === 'string') {
    return { label: raw, value: raw };
  }

  return isMap(raw) ? toJS<Option>(raw) : raw;
}

export default class SelectControl extends React.Component<
  CmsWidgetControlProps<string | string[] | null>
> {
  isValid = () => {
    const { field, value = '', t } = this.props;
    const min = field.min;
    const max = field.max;

    if (!field.multiple) {
      return { error: false };
    }

    const error = validations.validateMinMax(
      t,
      field.get('label', field.name),
      value as string[],
      min,
      max,
    );

    return error ? { error } : { error: false };
  };

  handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const selectedOption = event.target.value as string | string[];
    const { onChange, field } = this.props;
    const isMultiple: boolean = field.get('multiple', false);
    const isEmpty = isMultiple ? !selectedOption?.length : !selectedOption;

    if (field.required && isEmpty && isMultiple) {
      onChange(string[]());
    } else if (isEmpty) {
      onChange(null);
    } else if (typeof selectedOption === 'string') {
      onChange(selectedOption);
    } else if (isMultiple) {
      onChange(toList(selectedOption));
    }
  };

  componentDidMount() {
    const { field, onChange, value } = this.props;
    if (field.required && field.multiple) {
      if (value && !List.isList(value)) {
        onChange(toList([value]));
      } else if (!value) {
        onChange(toList([]));
      }
    }
  }

  render() {
    const { field, value, forID, setActiveStyle, setInactiveStyle } = this.props;
    const fieldOptions: string | Record<string, string[]> = field.options;
    const isMultiple = field.get('multiple', false);

    const options = [...(fieldOptions.map(convertToOption) as Option[])].filter(Boolean);

    return (
      <FormControl
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
      >
        <Select
          id={forID}
          value={(isList(value) ? toJS(value) : value) ?? (isMultiple ? [] : '')}
          onChange={event => this.handleChange(event)}
          multiple={isMultiple}
          onFocus={setActiveStyle}
          onBlur={setInactiveStyle}
        >
          {options.map(option => (
            <MenuItem key={`option-${option.value}`} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}
