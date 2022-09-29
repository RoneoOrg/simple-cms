import styled from '@emotion/styled';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import { oneLine } from 'common-tags';
import { List, Map } from 'immutable';
import { once } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import uuid from 'uuid/v4';

import { transientOptions } from '../../lib/util';
import { borders, buttons, components, effects, IconButton, lengths, shadows } from '../../ui';

import type { ComponentType, MouseEvent, MouseEventHandler } from 'react';
import type { CmsWidgetControlProps } from '../../interface';

const MAX_DISPLAY_LENGTH = 50;

interface ImageWrapperProps {
  $sortable?: boolean;
}

const ImageWrapper = styled('div', transientOptions)<ImageWrapperProps>`
  flex-basis: 155px;
  width: 155px;
  height: 100px;
  margin-right: 20px;
  margin-bottom: 20px;
  border: ${borders.textField};
  border-radius: ${lengths.borderRadius};
  overflow: hidden;
  ${effects.checkerboard};
  ${shadows.inset};
  cursor: ${props => (props.$sortable ? 'pointer' : 'auto')};
`;

const SortableImageButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  column-gap: 10px;
  margin-right: 20px;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

interface ImageProps {
  src: string;
}

function Image({ src }: ImageProps) {
  return <StyledImage role="presentation" src={src} />;
}

interface SortableImageButtonsProps {
  onRemove: MouseEventHandler;
  onReplace: MouseEventHandler;
}

function SortableImageButtons({ onRemove, onReplace }: SortableImageButtonsProps) {
  return (
    <SortableImageButtonsWrapper>
      <IconButton size="small" type="media" onClick={onReplace}></IconButton>
      <IconButton size="small" type="close" onClick={onRemove}></IconButton>
    </SortableImageButtonsWrapper>
  );
}

interface SortableImageProps {
  itemValue: any;
  getAsset: CmsWidgetControlProps['getAsset'];
  field: Map<string, any>;
  onRemove: MouseEventHandler;
  onReplace: MouseEventHandler;
}

const SortableImage: any = SortableElement(
  ({ itemValue, getAsset, field, onRemove, onReplace }: SortableImageProps) => {
    return (
      <div>
        <ImageWrapper $sortable>
          <Image src={getAsset(itemValue, field).url || ''} />
        </ImageWrapper>
        <SortableImageButtons onRemove={onRemove} onReplace={onReplace} />
      </div>
    );
  },
);

const StyledSortableMultiImageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

interface SortableMultiImageWrapperProps {
  items: string[] | List<string>;
  getAsset: CmsWidgetControlProps['getAsset'];
  field: Map<string, any>;
  onRemoveOne: (index: number) => MouseEventHandler;
  onReplaceOne: (index: number) => MouseEventHandler;
}

const SortableMultiImageWrapper: any = SortableContainer(
  ({ items, getAsset, field, onRemoveOne, onReplaceOne }: SortableMultiImageWrapperProps) => {
    return (
      <StyledSortableMultiImageWrapper>
        {items.map((itemValue, index) => {
          if (itemValue && index) {
            return (
              <SortableImage
                key={`item-${itemValue}`}
                index={index}
                itemValue={itemValue}
                getAsset={getAsset}
                field={field}
                onRemove={onRemoveOne(index)}
                onReplace={onReplaceOne(index)}
              />
            );
          }
        })}
      </StyledSortableMultiImageWrapper>
    );
  },
);

const FileLink = styled.a`
  margin-bottom: 20px;
  font-weight: normal;
  color: inherit;

  &:hover,
  &:active,
  &:focus {
    text-decoration: underline;
  }
`;

const FileLinks = styled.div`
  margin-bottom: 12px;
`;

const FileLinkList = styled.ul`
  list-style-type: none;
`;

const FileWidgetButton = styled.button`
  ${buttons.button};
  ${components.badge};
  margin-bottom: 12px;
`;

const FileWidgetButtonRemove = styled.button`
  ${buttons.button};
  ${components.badgeDanger};
`;

function isMultiple(
  value: string | string[] | List<string> | null,
): value is string[] | List<string> {
  return Array.isArray(value) || List.isList(value);
}

function sizeOfValue(value: string[] | List<string>) {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (List.isList(value)) {
    return value.size;
  }

  return value ? 1 : 0;
}

function valueListToArray(value: string[] | List<string>): string[] {
  return Array.isArray(value) ? value : value.toArray();
}

const warnDeprecatedOptions = once(field =>
  console.warn(oneLine`
  Netlify CMS config: ${field.get('name')} field: property "options" has been deprecated for the
  ${field.get('widget')} widget and will be removed in the next major release. Rather than
  \`field.options.media_library\`, apply media library options for this widget under
  \`field.media_library\`.
`),
);

interface WithFileControlProps {
  forImage?: boolean;
}

export default function withFileControl({
  forImage = false,
}: WithFileControlProps = {}): ComponentType<
  CmsWidgetControlProps<string | string[] | List<string> | null>
> {
  const FileControl = ({
    value = '',
    field,
    classNameWrapper,
    mediaPaths,
    onChange,
    getAsset,
    onOpenMediaLibrary,
    onClearMediaControl,
    onRemoveMediaControl,
    onRemoveInsertedMedia,
    t,
  }: CmsWidgetControlProps<string | string[] | List<string> | null>) => {
    const controlID = useMemo(() => uuid(), []);
    const subject = forImage ? 'image' : 'file';

    useEffect(() => {
      const mediaPath = mediaPaths.get(controlID);
      if (mediaPath && mediaPath !== value) {
        onChange(mediaPath);
      } else if (mediaPath && mediaPath === value) {
        onRemoveInsertedMedia(controlID);
      }
    }, [mediaPaths, value, onRemoveInsertedMedia, onChange, controlID]);

    useEffect(() => {
      return () => {
        onRemoveMediaControl(controlID);
      };
    }, []);

    //   getValidateValue = () => {
    //     const { value } = this.props;
    //     if (value) {
    //       return isMultiple(value) ? value.map(v => basename(v)) : basename(value);
    //     }

    //     return value;
    //   };

    const getMediaLibraryFieldOptions = useCallback(() => {
      if (field.hasIn(['options', 'media_library'])) {
        warnDeprecatedOptions(field);
        return field.getIn(['options', 'media_library'], Map());
      }

      return field.get('media_library', Map());
    }, [field]);

    const allowsMultiple = useCallback(() => {
      const mediaLibraryFieldOptions = getMediaLibraryFieldOptions();
      return (
        mediaLibraryFieldOptions.get('config', false) &&
        mediaLibraryFieldOptions.get('config').get('multiple', false)
      );
    }, [getMediaLibraryFieldOptions]);

    const onRemoveOne = useCallback(
      (value: string[] | List<string>) => (index: number) => () => {
        value.splice(index, 1);
        return onChange(sizeOfValue(value) > 0 ? [...valueListToArray(value)] : null);
      },
      [onChange],
    );

    const onReplaceOne = useCallback(
      (value: string[] | List<string>) => (index: number) => () => {
        const mediaLibraryFieldOptions = getMediaLibraryFieldOptions();

        return onOpenMediaLibrary({
          controlID,
          forImage,
          privateUpload: field.get('private'),
          value: valueListToArray(value),
          replaceIndex: index,
          allowMultiple: false,
          config: mediaLibraryFieldOptions.get('config'),
          field,
        });
      },
      [field, controlID, onOpenMediaLibrary, getMediaLibraryFieldOptions],
    );

    const onSortEnd = useCallback(
      (value: string[] | List<string>) =>
        ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
          const newValue = arrayMove(valueListToArray(value), oldIndex, newIndex);
          return onChange(newValue);
        },
      [onChange],
    );

    const renderImages = useCallback(() => {
      if (isMultiple(value)) {
        return (
          <SortableMultiImageWrapper
            items={value}
            onSortEnd={onSortEnd(value)}
            onRemoveOne={onRemoveOne(value)}
            onReplaceOne={onReplaceOne(value)}
            distance={4}
            getAsset={getAsset}
            field={field}
            axis="xy"
            lockToContainerEdges={true}
          />
        );
      }

      const src = getAsset(value ?? '', field);
      return (
        <ImageWrapper>
          <Image src={src.url || ''} />
        </ImageWrapper>
      );
    }, [getAsset, value, field]);

    const renderFileLink = useCallback((link: string | undefined | null) => {
      const size = MAX_DISPLAY_LENGTH;
      if (!link || link.length <= size) {
        return link;
      }
      const text = `${link.slice(0, size / 2)}\u2026${link.slice(-(size / 2) + 1)}`;
      return (
        <FileLink href={link} rel="noopener" target="_blank">
          {text}
        </FileLink>
      );
    }, []);

    const renderFileLinks = useCallback(() => {
      if (isMultiple(value)) {
        return (
          <FileLinks>
            <FileLinkList>
              {value.map(val => (
                <li key={val}>{renderFileLink(val)}</li>
              ))}
            </FileLinkList>
          </FileLinks>
        );
      }
      return <FileLinks>{renderFileLink(value)}</FileLinks>;
    }, [value, renderFileLink]);

    const handleChange = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        const mediaLibraryFieldOptions = getMediaLibraryFieldOptions();

        return onOpenMediaLibrary({
          controlID,
          forImage,
          privateUpload: field.get('private'),
          value: isMultiple(value) ? valueListToArray(value) : value ?? '',
          allowMultiple: !!mediaLibraryFieldOptions.get('allow_multiple', true),
          config: mediaLibraryFieldOptions.get('config'),
          field,
        });
      },
      [field, onOpenMediaLibrary, value, getMediaLibraryFieldOptions, controlID],
    );

    const handleUrl = useCallback(
      (subject: string) => (e: MouseEvent) => {
        e.preventDefault();

        const url = window.prompt(t(`editor.editorWidgets.${subject}.promptUrl`));

        return onChange(url);
      },
      [t, onChange],
    );

    const handleRemove = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        onClearMediaControl(controlID);
        return onChange('');
      },
      [onClearMediaControl, onChange, controlID],
    );

    const renderNoSelection = useCallback(
      (subject: string) => {
        return (
          <>
            <FileWidgetButton onClick={handleChange}>
              {t(`editor.editorWidgets.${subject}.choose${allowsMultiple() ? 'Multiple' : ''}`)}
            </FileWidgetButton>
            {field.get('choose_url', true) ? (
              <FileWidgetButton onClick={handleUrl(subject)}>
                {t(`editor.editorWidgets.${subject}.chooseUrl`)}
              </FileWidgetButton>
            ) : null}
          </>
        );
      },
      [t, field, handleChange, allowsMultiple, handleUrl],
    );

    const renderSelection = useCallback(
      (subject: string) => {
        const multiple = allowsMultiple();
        return (
          <div>
            {forImage ? renderImages() : null}
            <div>
              {forImage ? null : renderFileLinks()}
              <FileWidgetButton onClick={handleChange}>
                {t(`editor.editorWidgets.${subject}.${multiple ? 'addMore' : 'chooseDifferent'}`)}
              </FileWidgetButton>
              {field.get('choose_url', true) && !allowsMultiple ? (
                <FileWidgetButton onClick={handleUrl(subject)}>
                  {t(`editor.editorWidgets.${subject}.replaceUrl`)}
                </FileWidgetButton>
              ) : null}
              <FileWidgetButtonRemove onClick={handleRemove}>
                {t(`editor.editorWidgets.${subject}.remove${multiple ? 'All' : ''}`)}
              </FileWidgetButtonRemove>
            </div>
          </div>
        );
      },
      [allowsMultiple, forImage, renderImages, renderFileLinks, handleChange, handleUrl, handleRemove],
    );

    return (
      <div className={classNameWrapper}>
        <span>{value ? renderSelection(subject) : renderNoSelection(subject)}</span>
      </div>
    );
  };

  return FileControl;
}
