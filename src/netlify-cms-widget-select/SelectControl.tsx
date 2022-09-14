import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { fromJS, List, Map } from 'immutable';
import { validations } from '../netlify-cms-lib-widgets';
import React from 'react';

import type { SelectChangeEvent } from '@mui/material/Select';
import type { CmsWidgetControlProps } from '../netlify-cms-core';

interface Option {
  label: string;
  value: string;
}

function convertToOption(raw: string | Map<string, string> | undefined): Option | undefined {
  if (typeof raw === 'string') {
    return { label: raw, value: raw };
  }
  return Map.isMap(raw) ? (raw as Map<string, string>).toJS() : raw;
}

export default class SelectControl extends React.Component<
  CmsWidgetControlProps<string | List<string> | null>
> {
  isValid = () => {
    const { field, value = '', t } = this.props;
    const min = field.get('min');
    const max = field.get('max');

    if (!field.get('multiple')) {
      return { error: false };
    }

    const error = validations.validateMinMax(
      t,
      field.get('label', field.get('name')),
      value as List<string>,
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

    if (field.get('required') && isEmpty && isMultiple) {
      onChange(List<string>());
    } else if (isEmpty) {
      onChange(null);
    } else if (isMultiple) {
      onChange(fromJS(selectedOption));
    } else if (typeof selectedOption === 'string') {
      onChange(selectedOption);
    }
  };

  componentDidMount() {
    const { field, onChange, value } = this.props;
    if (field.get('required') && field.get('multiple')) {
      if (value && !List.isList(value)) {
        onChange(fromJS([value]));
      } else if (!value) {
        onChange(fromJS([]));
      }
    }
  }

  render() {
    const { field, value, forID, setActiveStyle, setInactiveStyle } = this.props;
    const fieldOptions: List<string | Map<string, string>> = field.get('options');
    const isMultiple = field.get('multiple', false);

    const options = [...(fieldOptions.map(convertToOption).toJS() as Option[])].filter(Boolean);

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
          value={
            (List.isList(value) ? (value as List<string>).toJS() : (value as string | undefined)) ??
            (isMultiple ? [] : '')
          }
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
