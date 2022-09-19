import { isFunction } from 'lodash';
import { EditorComponentField } from '..';

const catchesNothing = /.^/;

function bind(fn: Function) {
  return isFunction(fn) && fn.bind(null);
}

export interface CreateEditorComponentCommonProps {
  id: string;
  label: string;
  icon?: string;
}

export interface CreateEditorComponentElementProps extends CreateEditorComponentCommonProps {
  fields: EditorComponentField[];
  pattern: RegExp;
  allow_add?: boolean;
  fromBlock: (match: RegExpMatchArray) => any;
  toBlock: (data: any) => string;
  toPreview: (
    data: any,
    getAsset: (asset: string, field?: Record<string, any>) => string,
    field: Record<string, any>,
  ) => string | React.ReactNode;
}

export interface CreateEditorComponentWidgetProps extends CreateEditorComponentCommonProps {
  widget: string;
  type: string;
}

export type CreateEditorComponentProps =
  | CreateEditorComponentElementProps
  | CreateEditorComponentWidgetProps;

function isWidgetComponent(
  config: CreateEditorComponentProps,
): config is CreateEditorComponentWidgetProps {
  return 'widget' in config;
}

export default function createEditorComponent(config: CreateEditorComponentProps) {
  if (isWidgetComponent(config)) {
    const {
      id = null,
      label = 'unnamed component',
      icon = 'exclamation-triangle',
      type = 'shortcode',
      widget = 'object',
      ...remainingConfig
    } = config;

    return {
      id: id || label.replace(/[^A-Z0-9]+/gi, '_'),
      label,
      type,
      icon,
      widget,
      pattern: catchesNothing,
      fromBlock: () => ({}),
      toBlock: () => 'Plugin',
      toPreview: () => 'Plugin',
      fields: [],
      ...remainingConfig,
    };
  }

  const {
    id = null,
    label = 'unnamed component',
    icon = 'exclamation-triangle',
    pattern = catchesNothing,
    fields = [],
    fromBlock,
    toBlock,
    toPreview,
    ...remainingConfig
  } = config;

  return {
    id: id || label.replace(/[^A-Z0-9]+/gi, '_'),
    label,
    type: 'object',
    icon,
    widget: 'shortcode',
    pattern,
    fromBlock: bind(fromBlock) || (() => ({})),
    toBlock: bind(toBlock) || (() => 'Plugin'),
    toPreview: bind(toPreview) || bind(toBlock) || (() => 'Plugin'),
    fields,
    ...remainingConfig,
  };
}
