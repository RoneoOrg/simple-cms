import { isNumber } from 'lodash';

export function validateMinMax(
  t: (key: string, options: unknown) => string,
  fieldLabel: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any[],
  min?: number,
  max?: number,
) {
  function minMaxError(messageKey: string) {
    return {
      type: 'RANGE',
      message: t(`editor.editorControlPane.widget.${messageKey}`, {
        fieldLabel,
        minCount: min,
        maxCount: max,
        count: min,
      }),
    };
  }

  if ([min, max, value?.length].every(isNumber) && (value!.length < min! || value!.length > max!)) {
    return minMaxError(min === max ? 'rangeCountExact' : 'rangeCount');
  } else if (isNumber(min) && min > 0 && value?.length && value.length < min) {
    return minMaxError('rangeMin');
  } else if (isNumber(max) && value?.length && value.length > max) {
    return minMaxError('rangeMax');
  }
}
