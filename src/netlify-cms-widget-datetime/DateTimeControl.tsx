/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import formatDate from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import React from 'react';

import type { CmsWidgetControlProps } from '../netlify-cms-core';
import type { t } from 'react-polyglot';

function NowButton({ t, handleChange }: { t: t; handleChange: (value: Date) => void }) {
  return (
    <div
      css={css`
        position: absolute;
        right: 20px;
        transform: translateY(-40px);
        width: fit-content;
        z-index: 1;
      `}
    >
      <Button
        onClick={() => {
          handleChange(new Date());
        }}
      >
        {t('editor.editorWidgets.datetime.now')}
      </Button>
    </div>
  );
}

export default class DateTimeControl extends React.Component<CmsWidgetControlProps<string | null>> {
  getFormats() {
    const { field } = this.props;
    const format: string = field.get('format');

    // dateFormat and timeFormat are strictly for modifying
    // input field with the date/time pickers
    const dateFormat: string | boolean = field.get('date_format');
    // show time-picker? false hides it, true shows it using default format
    let timeFormat: string | boolean = field.get('time_format');
    if (typeof timeFormat === 'undefined') {
      timeFormat = true;
    }

    return {
      format,
      dateFormat,
      timeFormat,
    };
  }

  getDefaultValue() {
    const { field } = this.props;
    const defaultValue = field.get('default');
    return defaultValue;
  }

  getPickerUtc() {
    const { field } = this.props;
    const pickerUtc = field.get('picker_utc');
    return pickerUtc;
  }

  formats = this.getFormats();
  defaultValue = this.getDefaultValue();
  pickerUtc = this.getPickerUtc();

  componentDidMount() {
    const { value } = this.props;

    /**
     * Set the current date as default value if no value is provided and default is absent. An
     * empty default string means the value is intentionally blank.
     */
    if (value === undefined) {
      setTimeout(() => {
        this.handleChange(this.defaultValue === undefined ? new Date() : this.defaultValue);
      }, 0);
    }
  }

  handleChange = (datetime: Date | null) => {
    const { onChange } = this.props;
    const { format } = this.formats;

    if (datetime === null) {
      onChange(datetime);
      return;
    }

    /**
     * Produce a formatted string only if a format is set in the config.
     * Otherwise produce a date object.
     */
    if (format) {
      onChange(formatDate(datetime, format));
    } else {
      onChange(formatISO(datetime));
    }
  };

  render() {
    const { forID, value, setActiveStyle, setInactiveStyle, t, isDisabled } = this.props;
    const { dateFormat, timeFormat } = this.formats;

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {timeFormat ? (
          dateFormat ? (
            <MobileDateTimePicker
              inputFormat={`${typeof dateFormat === 'string' ? dateFormat : undefined} ${
                typeof timeFormat === 'string' ? timeFormat : undefined
              }`}
              value={value}
              onChange={this.handleChange}
              onOpen={setActiveStyle}
              onClose={setInactiveStyle}
              renderInput={params => (
                <TextField
                  id={forID}
                  {...params}
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
              )}
            />
          ) : (
            <TimePicker
              value={value}
              onChange={this.handleChange}
              onOpen={setActiveStyle}
              onClose={setInactiveStyle}
              renderInput={params => <TextField id={forID} {...params} fullWidth />}
            />
          )
        ) : (
          <MobileDatePicker
            inputFormat={typeof dateFormat === 'string' ? dateFormat : undefined}
            value={value}
            onChange={this.handleChange}
            onOpen={setActiveStyle}
            onClose={setInactiveStyle}
            renderInput={params => <TextField id={forID} {...params} fullWidth />}
          />
        )}
        {!isDisabled && <NowButton t={t} handleChange={v => this.handleChange(v)} />}
      </LocalizationProvider>
    );
  }
}
