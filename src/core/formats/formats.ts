import { get } from 'lodash';
import type { Collection, Entry, Format } from '../types/redux';
import type { Delimiter } from './frontmatter';
import { FrontmatterInfer, frontmatterJSON } from './frontmatter';
import jsonFormatter from './json';

export const frontmatterFormats = ['yaml-frontmatter', 'toml-frontmatter', 'json-frontmatter'];

export const formatExtensions = {
  json: 'json',
  frontmatter: 'md',
  'json-frontmatter': 'md',
};

export const extensionFormatters = {
  json: jsonFormatter,
  md: FrontmatterInfer,
  markdown: FrontmatterInfer,
  html: FrontmatterInfer,
};

function formatByName(name: Format, customDelimiter?: Delimiter) {
  return {
    json: jsonFormatter,
    frontmatter: FrontmatterInfer,
    'json-frontmatter': frontmatterJSON(customDelimiter),
  }[name];
}

export function resolveFormat(collection: Collection, entry: Entry | Entry) {
  // Check for custom delimiter
  const frontmatter_delimiter = collection.frontmatter_delimiter;
  const customDelimiter = Array.isArray(frontmatter_delimiter)
    ? (frontmatter_delimiter as [string, string])
    : frontmatter_delimiter;

  // If the format is specified in the collection, use that format.
  const formatSpecification = collection.format;
  if (formatSpecification) {
    return formatByName(formatSpecification, customDelimiter);
  }

  // If a file already exists, infer the format from its file extension.
  const filePath = entry && entry.path;
  if (filePath) {
    const fileExtension = filePath.split('.').pop();
    if (fileExtension) {
      return get(extensionFormatters, fileExtension);
    }
  }

  // If creating a new file, and an `extension` is specified in the
  //   collection config, infer the format from that extension.
  const extension = collection.extension;
  if (extension) {
    return get(extensionFormatters, extension);
  }

  // If no format is specified and it cannot be inferred, return the default.
  return formatByName('frontmatter', customDelimiter);
}
