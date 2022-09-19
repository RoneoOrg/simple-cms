import bootstrap from './bootstrap';
import Registry from './lib/registry';

import type { ComponentType } from 'react';
import type { t } from 'react-polyglot';
import type { CmsConfig } from './types/redux';
import { FILES, FOLDER } from './constants/collectionTypes';

export type CmsBackendType =
  | 'azure'
  | 'git-gateway'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'test-repo'
  | 'proxy';

export type CmsMapWidgetType = 'Point' | 'LineString' | 'Polygon';

export type CmsMarkdownWidgetButton =
  | 'bold'
  | 'italic'
  | 'code'
  | 'link'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'heading-four'
  | 'heading-five'
  | 'heading-six'
  | 'quote'
  | 'code-block'
  | 'bulleted-list'
  | 'numbered-list';

export interface CmsSelectWidgetOptionObject {
  label: string;
  value: any;
}

export type CmsCollectionFormatType =
  | 'yml'
  | 'yaml'
  | 'toml'
  | 'json'
  | 'frontmatter'
  | 'yaml-frontmatter'
  | 'toml-frontmatter'
  | 'json-frontmatter';

export type CmsAuthScope = 'repo' | 'public_repo';

export type CmsSlugEncoding = 'unicode' | 'ascii';

export interface CmsI18nConfig {
  structure: 'multiple_folders' | 'multiple_files' | 'single_file';
  locales: string[];
  default_locale?: string;
}

export interface CmsFieldBase {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
  pattern?: [string, string];
  meta?: boolean;
  i18n?: boolean | 'translate' | 'duplicate' | 'none';
  media_folder?: string;
  public_folder?: string;
  comment?: string;
}

export interface CmsFieldBoolean {
  widget: 'boolean';
  default?: boolean;
}

export interface CmsFieldCode {
  widget: 'code';
  default?: any;

  default_language?: string;
  allow_language_selection?: boolean;
  keys?: { code: string; lang: string };
  output_code_only?: boolean;
}

export interface CmsFieldColor {
  widget: 'color';
  default?: string;

  allowInput?: boolean;
  enableAlpha?: boolean;
}

export interface CmsFieldDateTime {
  widget: 'datetime';
  default?: string;

  format?: string;
  date_format?: boolean | string;
  time_format?: boolean | string;
  picker_utc?: boolean;

  /**
   * @deprecated Use date_format instead
   */
  dateFormat?: boolean | string;
  /**
   * @deprecated Use time_format instead
   */
  timeFormat?: boolean | string;
  /**
   * @deprecated Use picker_utc instead
   */
  pickerUtc?: boolean;
}

export interface CmsFieldFileOrImage {
  widget: 'file' | 'image';
  default?: string;

  media_library?: CmsMediaLibrary;
  allow_multiple?: boolean;
  config?: any;
}

export interface CmsFieldObject {
  widget: 'object';
  default?: any;

  collapsed?: boolean;
  summary?: string;
  fields: CmsField[];
}

export interface CmsFieldList {
  widget: 'list';
  default?: any;

  allow_add?: boolean;
  collapsed?: boolean;
  summary?: string;
  minimize_collapsed?: boolean;
  label_singular?: string;
  field?: CmsField;
  fields?: CmsField[];
  max?: number;
  min?: number;
  add_to_top?: boolean;
  types?: (CmsFieldBase & CmsFieldObject)[];
}

export interface CmsFieldMap {
  widget: 'map';
  default?: string;

  decimals?: number;
  type?: CmsMapWidgetType;
}

export interface CmsFieldNumber {
  widget: 'number';
  default?: string | number;

  value_type?: 'int' | 'float' | string;
  min?: number;
  max?: number;

  step?: number;

  /**
   * @deprecated Use valueType instead
   */
  valueType?: 'int' | 'float' | string;
}

export interface CmsFieldSelect {
  widget: 'select';
  default?: string | string[];

  options: string[] | CmsSelectWidgetOptionObject[];
  multiple?: boolean;
  min?: number;
  max?: number;
}

export interface CmsFieldRelation {
  widget: 'relation';
  default?: string | string[];

  collection: string;
  value_field: string;
  search_fields: string[];
  file?: string;
  display_fields?: string[];
  multiple?: boolean;
  options_length?: number;

  /**
   * @deprecated Use value_field instead
   */
  valueField?: string;
  /**
   * @deprecated Use search_fields instead
   */
  searchFields?: string[];
  /**
   * @deprecated Use display_fields instead
   */
  displayFields?: string[];
  /**
   * @deprecated Use options_length instead
   */
  optionsLength?: number;
}

export interface CmsFieldHidden {
  widget: 'hidden';
  default?: any;
}

export interface CmsFieldStringOrText {
  // This is the default widget, so declaring its type is optional.
  widget?: 'string' | 'text';
  default?: string;
}

export interface CmsFieldMeta {
  name: string;
  label: string;
  widget: string;
  required: boolean;
  index_file: string;
  meta: boolean;
}

export type CmsField = CmsFieldBase &
  (
    | CmsFieldBoolean
    | CmsFieldCode
    | CmsFieldColor
    | CmsFieldDateTime
    | CmsFieldFileOrImage
    | CmsFieldList
    | CmsFieldMap
    | CmsFieldNumber
    | CmsFieldObject
    | CmsFieldRelation
    | CmsFieldSelect
    | CmsFieldHidden
    | CmsFieldStringOrText
    | CmsFieldMeta
  );

export interface CollectionFile {
  name: string;
  label: string;
  file: string;
  fields: CmsField[];
  label_singular?: string;
  description?: string;
  preview_path?: string;
  preview_path_date_field?: string;
  i18n?: boolean | CmsI18nConfig;
  media_folder?: string;
  public_folder?: string;
}

export interface ViewFilter {
  label: string;
  field: string;
  pattern: string | boolean;
}

export interface ViewGroup {
  label: string;
  field: string;
  pattern?: string;
}

export interface Collection {
  name: string;
  label: string;
  label_singular?: string;
  description?: string;
  folder?: string;
  files?: CollectionFile[];
  identifier_field?: string;
  summary?: string;
  slug?: string;
  preview_path?: string;
  preview_path_date_field?: string;
  create?: boolean;
  delete?: boolean;
  editor?: {
    preview?: boolean;
  };
  publish?: boolean;
  nested?: {
    depth: number;
  };
  type: typeof FOLDER | typeof FILES;
  meta?: { path?: { label: string; widget: string; index_file: string } };

  /**
   * It accepts the following values: yml, yaml, toml, json, md, markdown, html
   *
   * You may also specify a custom extension not included in the list above, by specifying the format value.
   */
  extension?: string;
  format?: CmsCollectionFormatType;

  frontmatter_delimiter?: string[] | string;
  fields?: CmsField[];
  filter?: { field: string; value: string };
  path?: string;
  media_folder?: string;
  public_folder?: string;
  sortable_fields?: string[];
  view_filters?: ViewFilter[];
  view_groups?: ViewGroup[];
  i18n?: false | CmsI18nConfig;

  /**
   * @deprecated Use sortable_fields instead
   */
  sortableFields?: string[];
  isFetching?: boolean;
  hide?: boolean;
}

export interface CmsBackend {
  name: CmsBackendType;
  auth_scope?: CmsAuthScope;
  repo?: string;
  branch?: string;
  api_root?: string;
  site_domain?: string;
  base_url?: string;
  auth_endpoint?: string;
  app_id?: string;
  auth_type?: 'implicit' | 'pkce';
  cms_label_prefix?: string;
  proxy_url?: string;
  commit_messages?: {
    create?: string;
    update?: string;
    delete?: string;
    uploadMedia?: string;
    deleteMedia?: string;
  };
}

export interface CmsSlug {
  encoding?: CmsSlugEncoding;
  clean_accents?: boolean;
  sanitize_replacement?: string;
}

export interface CmsLocalBackend {
  url?: string;
  allowed_hosts?: string[];
}

export type { CmsConfig };

export interface InitOptions {
  config: CmsConfig;
}

export interface EditorComponentField {
  name: string;
  label: string;
  widget?: string;
  media_library?: CmsMediaLibraryOptions;
}

export interface PreviewStyleOptions {
  raw: boolean;
}

export interface PreviewStyle extends PreviewStyleOptions {
  value: string;
}

export type CmsBackendClass = any; // TODO: type properly

export interface CmsRegistryBackend {
  init: (args: any) => CmsBackendClass;
}

export interface CmsWidgetControlProps<T = any> {
  value: T;
  field: Record<string, any>;
  onChange: (value: T) => void;
  forID: string;
  classNameWrapper: string;
  setActiveStyle: <E = Element>(event?: React.FocusEvent<E, Element>) => void;
  setInactiveStyle: <E = Element>(event?: React.FocusEvent<E, Element>) => void;
  isDisabled: boolean;
  t: t;
}

export interface CmsWidgetPreviewProps<T = any> {
  value: T;
  field: Record<string, any>;
  metadata: Record<string, any>;
  getAsset: GetAssetFunction;
  entry: Record<string, any>;
  fieldsMetaData: Record<string, any>;
}

export interface Schema {
  properties: Record<string, any> | undefined;
  required?: string[];
}

export interface CmsWidgetParam<T = any> {
  name: string;
  controlComponent: React.ComponentType<CmsWidgetControlProps<T>>;
  previewComponent?: React.ComponentType<CmsWidgetPreviewProps<T>>;
  schema?: Schema;
  globalStyles?: any;
}

export interface CmsWidget<T = any> {
  control: React.Component<CmsWidgetControlProps<T>>;
  preview?: React.ComponentType<CmsWidgetPreviewProps<T>>;
  schema?: Schema;
  globalStyles?: any;
}

export type CmsWidgetValueSerializer = any; // TODO: type properly

export type CmsMediaLibraryOptions = any; // TODO: type properly

export interface CmsMediaLibrary {
  name: string;
  config?: CmsMediaLibraryOptions;
}

export interface CmsEventListener {
  name: 'prePublish' | 'postPublish' | 'preUnpublish' | 'postUnpublish' | 'preSave' | 'postSave';
  handler: ({
    entry,
    author,
  }: {
    entry: Record<string, any>;
    author: { login: string; name: string };
  }) => any;
}

export type CmsEventListenerOptions = any; // TODO: type properly

export type CmsLocalePhrases = any; // TODO: type properly

export interface CmsRegistry {
  backends: {
    [name: string]: CmsRegistryBackend;
  };
  templates: {
    [name: string]: ComponentType<any>;
  };
  previewStyles: PreviewStyle[];
  widgets: {
    [name: string]: CmsWidget;
  };
  editorComponents: Record<string, ComponentType<any>>;
  widgetValueSerializers: {
    [name: string]: CmsWidgetValueSerializer;
  };
  mediaLibraries: CmsMediaLibrary[];
  locales: {
    [name: string]: CmsLocalePhrases;
  };
}

type GetAssetFunction = (asset: string) => {
  url: string;
  path: string;
  field?: any;
  fileObj: File;
};

export type PreviewTemplateComponentProps = {
  entry: Record<string, any>;
  collection: Record<string, any>;
  widgetFor: (name: any, fields?: any, values?: any, fieldsMetaData?: any) => JSX.Element | null;
  widgetsFor: (name: any) => any;
  getAsset: GetAssetFunction;
  boundGetAsset: (collection: any, path: any) => GetAssetFunction;
  fieldsMetaData: Record<string, any>;
  config: Record<string, any>;
  fields: Record<string, any[]>;
  isLoadingAsset: boolean;
  window: Window;
  document: Document;
};

export interface CMS {
  getBackend: (name: string) => CmsRegistryBackend | undefined;
  getLocale: (locale: string) => CmsLocalePhrases | undefined;
  getMediaLibrary: (name: string) => CmsMediaLibrary | undefined;
  resolveWidget: (name: string) => CmsWidget | undefined;
  getPreviewStyles: () => PreviewStyle[];
  getPreviewTemplate: (name: string) => ComponentType<PreviewTemplateComponentProps> | undefined;
  getWidget: (name: string) => CmsWidget | undefined;
  getWidgetValueSerializer: (widgetName: string) => CmsWidgetValueSerializer | undefined;
  init: (options: InitOptions) => void;
  registerBackend: (name: string, backendClass: CmsBackendClass) => void;
  registerEventListener: (
    eventListener: CmsEventListener,
    options?: CmsEventListenerOptions,
  ) => void;
  registerLocale: (locale: string, phrases: CmsLocalePhrases) => void;
  registerMediaLibrary: (mediaLibrary: CmsMediaLibrary, options?: CmsMediaLibraryOptions) => void;
  registerPreviewStyle: (filePath: string, options?: PreviewStyleOptions) => void;
  registerPreviewTemplate: (
    name: string,
    component: ComponentType<PreviewTemplateComponentProps>,
  ) => void;
  registerWidget: (
    widget: string | CmsWidgetParam | CmsWidgetParam[],
    control?: ComponentType<CmsWidgetControlProps> | string,
    preview?: ComponentType<CmsWidgetPreviewProps>,
  ) => void;
  registerWidgetValueSerializer: (widgetName: string, serializer: CmsWidgetValueSerializer) => void;
}

export const NetlifyCmsCore: CMS = {
  ...Registry,
  init: bootstrap,
};

export default NetlifyCmsCore;
