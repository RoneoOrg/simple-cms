import { get } from 'lodash';
import { Collection } from '..';
import type { Entry, Format } from '../types/redux';
import type { Delimiter } from './frontmatter';
import { FrontmatterInfer, frontmatterJSON, frontmatterYAML } from './frontmatter';
import jsonFormatter from './json';
import yamlFormatter from './yaml';

export const frontmatterFormats = ['yaml-frontmatter', 'json-frontmatter'];

export const formatExtensions = {
  yml: 'yml',
  yaml: 'yml',
  json: 'json',
  frontmatter: 'md',
  'json-frontmatter': 'md',
  'yaml-frontmatter': 'md',
};

export const extensionFormatters = {
  yml: yamlFormatter,
  yaml: yamlFormatter,
  json: jsonFormatter,
  md: FrontmatterInfer,
  markdown: FrontmatterInfer,
  html: FrontmatterInfer,
};

function formatByName(name: Format, customDelimiter?: Delimiter) {
  return {
    yml: yamlFormatter,
    yaml: yamlFormatter,
    json: jsonFormatter,
    frontmatter: FrontmatterInfer,
    'json-frontmatter': frontmatterJSON(customDelimiter),
    'yaml-frontmatter': frontmatterYAML(customDelimiter),
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
