import { keyToPathArray } from '../widgets/stringTemplate';

function getInViaPath(object: Record<string, any>, path: string[]): any | undefined {
  const key = path.shift();
  if (!key) {
    return object;
  }

  if (!(key in object)) {
    return undefined;
  }

  return getInViaPath(object[key], path);
}

export function getIn(object: Record<string, any>, key: string): any | undefined;
export function getIn(object: Record<string, any>, key: string[]): any | undefined;
export function getIn(object: Record<string, any>, key: string | string[]): any | undefined {
  let path: string[];
  if (Array.isArray(key)) {
    path = key;
  } else {
    path = keyToPathArray(key);
  }

  if (path.length > 0) {
    return getInViaPath(object, path);
  }

  return undefined;
}
