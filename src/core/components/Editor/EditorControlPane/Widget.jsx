import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { oneLine } from 'common-tags';

import ValidationErrorTypes from '../../../constants/validationErrorTypes';

function truthy() {
  return { error: false };
}

function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    (Object.prototype.hasOwnProperty.call(value, 'length') && value.length === 0) ||
    (value.constructor === Object && Object.keys(value).length === 0) ||
    (Array.isArray(value) && value.size === 0)
  );
}

export default class Widget extends Component {
  static propTypes = {
    controlComponent: PropTypes.func.isRequired,
    field: PropTypes.object.isRequired,
    hasActiveStyle: PropTypes.bool,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
    classNameWrapper: PropTypes.string.isRequired,
    classNameWidget: PropTypes.string.isRequired,
    classNameWidgetActive: PropTypes.string.isRequired,
    classNameLabel: PropTypes.string.isRequired,
    classNameLabelActive: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.object,
      PropTypes.string,
      PropTypes.bool,
    ]),
    mediaPaths: PropTypes.object.isRequired,
    metadata: PropTypes.object,
    fieldsErrors: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
    onOpenMediaLibrary: PropTypes.func.isRequired,
    onClearMediaControl: PropTypes.func.isRequired,
    onRemoveMediaControl: PropTypes.func.isRequired,
    onPersistMedia: PropTypes.func.isRequired,
    onAddAsset: PropTypes.func.isRequired,
    onRemoveInsertedMedia: PropTypes.func.isRequired,
    getAsset: PropTypes.func.isRequired,
    resolveWidget: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    isFetching: PropTypes.bool,
    controlRef: PropTypes.func,
    query: PropTypes.func.isRequired,
    clearSearch: PropTypes.func.isRequired,
    clearFieldErrors: PropTypes.func.isRequired,
    queryHits: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    editorControl: PropTypes.elementType.isRequired,
    uniqueFieldId: PropTypes.string.isRequired,
    loadEntry: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    onValidateObject: PropTypes.func,
    isEditorComponent: PropTypes.bool,
    isNewEditorComponent: PropTypes.bool,
    entry: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
    isFieldDuplicate: PropTypes.func,
    isFieldHidden: PropTypes.func,
    locale: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    /**
     * Allow widgets to provide their own `shouldComponentUpdate` method.
     */
    if (this.wrappedControlShouldComponentUpdate) {
      return this.wrappedControlShouldComponentUpdate(nextProps);
    }
    return (
      this.props.value !== nextProps.value ||
      this.props.classNameWrapper !== nextProps.classNameWrapper ||
      this.props.hasActiveStyle !== nextProps.hasActiveStyle
    );
  }

  processInnerControlRef = ref => {
    if (!ref) return;

    /**
     * If the widget is a container that receives state updates from the store,
     * we'll need to get the ref of the actual control via the `react-redux`
     * `getWrappedInstance` method. Note that connected widgets must pass
     * `withRef: true` to `connect` in the options object.
     */
    this.innerWrappedControl = ref.getWrappedInstance ? ref.getWrappedInstance() : ref;

    this.wrappedControlValid = this.innerWrappedControl.isValid || truthy;

    /**
     * Get the `shouldComponentUpdate` method from the wrapped control, and
     * provide the control instance is the `this` binding.
     */
    const { shouldComponentUpdate: scu } = this.innerWrappedControl;
    this.wrappedControlShouldComponentUpdate = scu && scu.bind(this.innerWrappedControl);
  };

  getValidateValue = () => {
    let value = this.innerWrappedControl?.getValidateValue?.() || this.props.value;
    // Convert list input widget value to string for validation test
    Array.isArray(value) && (value = value.join(','));
    return value;
  };

  validate = (skipWrapped = false) => {
    const value = this.getValidateValue();
    const field = this.props.field;
    const errors = [];
    const validations = [this.validatePresence, this.validatePattern];
    if (field.meta) {
      validations.push(this.props.validateMetaField);
    }
    validations.forEach(func => {
      const response = func(field, value, this.props.t);
      if (response.error) errors.push(response.error);
    });
    if (skipWrapped) {
      if (skipWrapped.error) errors.push(skipWrapped.error);
    } else {
      const wrappedError = this.validateWrappedControl(field);
      if (wrappedError.error) errors.push(wrappedError.error);
    }

    this.props.onValidate(errors);
  };

  validatePresence = (field, value) => {
    const { t, parentIds } = this.props;
    const isRequired = field.required ?? true;
    if (isRequired && isEmpty(value)) {
      const error = {
        type: ValidationErrorTypes.PRESENCE,
        parentIds,
        message: t('editor.editorControlPane.widget.required', {
          fieldLabel: field.labelo ?? field.name,
        }),
      };

      return { error };
    }
    return { error: false };
  };

  validatePattern = (field, value) => {
    const { t, parentIds } = this.props;
    const pattern = field.pattern ?? false;
    const patterns = !pattern || Array.isArray(pattern) ? pattern : [pattern];

    if (isEmpty(value)) {
      return { error: false };
    }

    if (patterns?.length && !RegExp(patterns[0]).test(value)) {
      const error = {
        type: ValidationErrorTypes.PATTERN,
        parentIds,
        message: t('editor.editorControlPane.widget.regexPattern', {
          fieldLabel: field.label ?? field.name,
          pattern: patterns[patterns.length - 1],
        }),
      };

      return { error };
    }

    return { error: false };
  };

  validateWrappedControl = field => {
    const { t, parentIds } = this.props;
    if (typeof this.wrappedControlValid !== 'function') {
      throw new Error(oneLine`
        this.wrappedControlValid is not a function. Are you sure widget
        "${field.widget}" is registered?
      `);
    }

    const response = this.wrappedControlValid();
    if (typeof response === 'boolean') {
      const isValid = response;
      return { error: !isValid };
    } else if (Object.prototype.hasOwnProperty.call(response, 'error')) {
      return response;
    } else if (response instanceof Promise) {
      response.then(
        () => {
          this.validate({ error: false });
        },
        err => {
          const error = {
            type: ValidationErrorTypes.CUSTOM,
            message: `${field.label ?? field.name} - ${err}.`,
          };

          this.validate({ error });
        },
      );

      const error = {
        type: ValidationErrorTypes.CUSTOM,
        parentIds,
        message: t('editor.editorControlPane.widget.processing', {
          fieldLabel: field.label ?? field.name,
        }),
      };

      return { error };
    }
    return { error: false };
  };

  /**
   * In case the `onChangeObject` function is frozen by a child widget implementation,
   * e.g. when debounced, always get the latest object value instead of using
   * `this.props.value` directly.
   */
  getObjectValue = () => this.props.value || {};

  /**
   * Change handler for fields that are nested within another field.
   */
  onChangeObject = (field, newValue, newMetadata) => {
    const newObjectValue = this.getObjectValue().set(field.name, newValue);
    return this.props.onChange(
      newObjectValue,
      newMetadata && { [this.props.field.name]: newMetadata },
    );
  };

  setInactiveStyle = () => {
    this.props.setInactiveStyle();
    if (this.props.field.pattern && !isEmpty(this.getValidateValue())) {
      this.validate();
    }
  };

  render() {
    const {
      controlComponent,
      entry,
      collection,
      config,
      field,
      value,
      mediaPaths,
      metadata,
      onChange,
      onValidateObject,
      onOpenMediaLibrary,
      onRemoveMediaControl,
      onPersistMedia,
      onClearMediaControl,
      onAddAsset,
      onRemoveInsertedMedia,
      getAsset,
      classNameWrapper,
      classNameWidget,
      classNameWidgetActive,
      classNameLabel,
      classNameLabelActive,
      setActiveStyle,
      hasActiveStyle,
      editorControl,
      uniqueFieldId,
      resolveWidget,
      widget,
      query,
      queryHits,
      clearSearch,
      clearFieldErrors,
      isFetching,
      loadEntry,
      fieldsErrors,
      controlRef,
      isEditorComponent,
      isNewEditorComponent,
      parentIds,
      t,
      isDisabled,
      isFieldDuplicate,
      isFieldHidden,
      locale,
    } = this.props;

    return React.createElement(controlComponent, {
      entry,
      collection,
      config,
      field,
      value,
      mediaPaths,
      metadata,
      onChange,
      onChangeObject: this.onChangeObject,
      onValidateObject,
      onOpenMediaLibrary,
      onClearMediaControl,
      onRemoveMediaControl,
      onPersistMedia,
      onAddAsset,
      onRemoveInsertedMedia,
      getAsset,
      forID: uniqueFieldId,
      ref: this.processInnerControlRef,
      validate: this.validate,
      classNameWrapper,
      classNameWidget,
      classNameWidgetActive,
      classNameLabel,
      classNameLabelActive,
      setActiveStyle,
      setInactiveStyle: () => this.setInactiveStyle(),
      hasActiveStyle,
      editorControl,
      resolveWidget,
      widget,
      query,
      queryHits,
      clearSearch,
      clearFieldErrors,
      isFetching,
      loadEntry,
      isEditorComponent,
      isNewEditorComponent,
      fieldsErrors,
      controlRef,
      parentIds,
      t,
      isDisabled,
      isFieldDuplicate,
      isFieldHidden,
      locale,
    });
  }
}
