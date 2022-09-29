import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import isValid from 'date-fns/isValid';
import React, { useCallback, useEffect, useMemo } from 'react';

import { buttons } from '../../ui';

import type { TranslateProps } from 'react-polyglot';
import type { CmsWidgetControlProps } from '../../interface';
import formatISO from 'date-fns/formatISO';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

const StyledNowButtonWrapper = styled.div`
  position: absolute;
  right: 20px;
  transform: translateY(-40px);
  width: fit-content;
  z-index: 1;
`;

const StyledNowButton = styled.button`
  ${buttons.button}
`;

interface NowButtonProps extends TranslateProps {
  handleChange: (datetime: string | Date | null) => void;
}

const NowButton = ({ t, handleChange }: NowButtonProps) => {
  return (
    <StyledNowButtonWrapper>
      <StyledNowButton
        onClick={() => {
          handleChange(new Date());
        }}
      >
        {t('editor.editorWidgets.datetime.now')}
      </StyledNowButton>
    </StyledNowButtonWrapper>
  );
};

const StyledDateTimeControl = styled.div`
  position: relative;
`;

const DateTimeControl = ({
  forID,
  field,
  value,
  setActiveStyle,
  setInactiveStyle,
  onChange,
  t,
  isDisabled,
}: CmsWidgetControlProps<string | Date>) => {
  const getFormats = useCallback(() => {
    const format = field.get('format');

    // dateFormat and timeFormat are strictly for modifying
    // input field with the date/time pickers
    const dateFormat = field.get('date_format');
    // show time-picker? false hides it, true shows it using default format
    let timeFormat = field.get('time_format');
    if (typeof timeFormat === 'undefined') {
      timeFormat = true;
    }

    return {
      format,
      dateFormat,
      timeFormat,
    };
  }, [field]);

  const getDefaultValue = useCallback(() => {
    const defaultValue = field.get('default');
    return defaultValue;
  }, [field]);

  const formats = useMemo(() => getFormats(), [getFormats]);
  const defaultValue = useMemo(() => getDefaultValue(), [getDefaultValue]);

  const handleChange = useCallback(
    (datetime: string | Date | null) => {
      console.log('datetime', datetime);
      if (!datetime || datetime === '') {
        onChange('');
        return;
      }

      const parsedDate = typeof datetime === 'string' ? parseISO(datetime) : datetime;

      /**
       * Set the date only if it is valid.
       */
      if (!isValid(datetime)) {
        return;
      }

      const { format: formatStr } = formats;

      /**
       * Produce a formatted string only if a format is set in the config.
       * Otherwise produce a date object.
       */
      if (formatStr) {
        onChange(format(parsedDate, formatStr));
      } else {
        onChange(formatISO(parsedDate));
      }
    },
    [onChange, formats],
  );

  useEffect(() => {
    if (value === undefined) {
      setTimeout(() => {
        handleChange(defaultValue === undefined ? new Date() : defaultValue);
      }, 0);
    }
  }, [value, defaultValue, handleChange]);

  const { dateFormat, timeFormat } = formats;

  return (
    <StyledDateTimeControl>
      {timeFormat ? (
        dateFormat ? (
          <MobileDateTimePicker
            inputFormat={`${typeof dateFormat === 'string' ? dateFormat : undefined} ${
              typeof timeFormat === 'string' ? timeFormat : undefined
            }`}
            value={value}
            onChange={event => {
              console.log(typeof event);
            }}
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
            onChange={handleChange}
            onOpen={setActiveStyle}
            onClose={setInactiveStyle}
            renderInput={params => <TextField id={forID} {...params} fullWidth />}
          />
        )
      ) : (
        <MobileDatePicker
          inputFormat={typeof dateFormat === 'string' ? dateFormat : undefined}
          value={value}
          onChange={handleChange}
          onOpen={setActiveStyle}
          onClose={setInactiveStyle}
          renderInput={params => <TextField id={forID} {...params} fullWidth />}
        />
      )}
      {!isDisabled && <NowButton t={t} handleChange={handleChange} />}
    </StyledDateTimeControl>
  );
};

export default DateTimeControl;
