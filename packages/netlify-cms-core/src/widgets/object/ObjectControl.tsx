import { ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { List, Map } from 'immutable';
import React, { useCallback, useState } from 'react';

import { stringTemplate } from '../../lib/widgets';
import { colors, lengths, ObjectWidgetTopBar } from '../../ui';

import type { CmsWidgetControlProps } from '../../interface';

const styleStrings = {
  nestedObjectControl: `
    padding: 6px 14px 0;
    border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  `,
  objectWidgetTopBarContainer: `
    padding: ${lengths.objectWidgetTopBarContainerPadding};
  `,
  collapsedObjectControl: `
    display: none;
  `,
};

const StyledFieldsBox = styled.div`
  padding-bottom: 14px;
`;

const ObjectControl = ({
  field,
  metadata,
  forID,
  classNameWrapper,
  forList,
  hasError,
  collapsed: parentCollapsed,
  value = Map(),
  fieldsErrors,
  controlRef,
  parentIds,
  locale,
  editorControl: EditorControl,
  onChangeObject,
  clearFieldErrors,
  onValidateObject,
  isFieldDuplicate,
  isFieldHidden,
  t,
}: CmsWidgetControlProps) => {
  const [collapsed, setCollapsed] = useState(field.get('collapsed', false));
  const isCollapsed = forList ? parentCollapsed : collapsed;
  const multiFields = field.get('fields');
  const singleField = field.get('field');

  const validate = useCallback(() => {
    let fields = field.get('field') || field.get('fields');
    fields = List.isList(fields) ? fields : List([fields]);
    fields.forEach((field: Map<string, any>) => {
      if (field.get('widget') === 'hidden') {
        return;
      }
      // TODO WHAT IS THIS? componentValidate[field.get('name')]();
    });
  }, [field]);

  const controlFor = useCallback(
    (field: Map<string, any>, key?: number) => {
      if (field.get('widget') === 'hidden') {
        return null;
      }
      const fieldName = field.get('name');
      const fieldValue = value && Map.isMap(value) ? value.get(fieldName) : value;

      const isDuplicate = isFieldDuplicate && isFieldDuplicate(field);
      const isHidden = isFieldHidden && isFieldHidden(field);

      return (
        <EditorControl
          key={key}
          field={field}
          value={fieldValue}
          onChange={onChangeObject}
          clearFieldErrors={clearFieldErrors}
          fieldsMetaData={metadata}
          fieldsErrors={fieldsErrors}
          onValidate={onValidateObject}
          controlRef={controlRef}
          parentIds={parentIds}
          isDisabled={isDuplicate}
          isHidden={isHidden}
          isFieldDuplicate={isFieldDuplicate}
          isFieldHidden={isFieldHidden}
          locale={locale}
        />
      );
    },
    [
      value,
      onChangeObject,
      onValidateObject,
      clearFieldErrors,
      metadata,
      fieldsErrors,
      EditorControl,
      controlRef,
      parentIds,
      isFieldDuplicate,
      isFieldHidden,
      locale,
    ],
  );

  const renderFields = useCallback(
    (multiFields: List<Map<string, any>>, singleField: Map<string, any>) => {
      if (multiFields) {
        return multiFields.map((f, idx) => (f && idx ? controlFor(f, idx) : null));
      }
      return controlFor(singleField);
    },
    [controlFor],
  );

  const objectLabel = useCallback(() => {
    const label = field.get('label', field.get('name'));
    const summary = field.get('summary');
    return summary ? stringTemplate.compileStringTemplate(summary, null, '', value) : label;
  }, [value, field]);

  const handleCollapseToggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  if (multiFields || singleField) {
    return (
      <ClassNames>
        {({ css, cx }) => (
          <div
            id={forID}
            className={cx(
              classNameWrapper,
              css`
                ${styleStrings.objectWidgetTopBarContainer}
              `,
              {
                [css`
                  ${styleStrings.nestedObjectControl}
                `]: forList,
              },
              {
                [css`
                  border-color: ${colors.textFieldBorder};
                `]: forList ? !hasError : false,
              },
            )}
          >
            {forList ? null : (
              <ObjectWidgetTopBar
                collapsed={isCollapsed}
                onCollapseToggle={handleCollapseToggle}
                heading={collapsed && objectLabel()}
                t={t}
              />
            )}
            <StyledFieldsBox
              className={cx({
                [css`
                  ${styleStrings.collapsedObjectControl}
                `]: collapsed,
              })}
            >
              {renderFields(multiFields, singleField)}
            </StyledFieldsBox>
          </div>
        )}
      </ClassNames>
    );
  }

  return <h3>No field(s) defined for this widget</h3>;
};

export default ObjectControl;
