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

export function getIn(object: Record<string, any>, key: undefined): undefined;
export function getIn(object: Record<string, any>, key: string): any | undefined;
export function getIn(object: Record<string, any>, key: string[]): any | undefined;
export function getIn(object: Record<string, any>, key: undefined | string | string[]): any | undefined {
  if (!key) {
    return undefined;
  }

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

function setInViaPath(object: Record<string, any>, path: string[], value: any): any | undefined {
  const key = path.shift();
  if (!key) {
    return value;
  }

  object = {
    ...object,
    [key]: setInViaPath(object[key], path, value),
  };

  return object;
}

export function setIn(object: Record<string, any>, key: string, value: any): any | undefined;
export function setIn(object: Record<string, any>, key: string[], value: any): any | undefined;
export function setIn(
  object: Record<string, any>,
  key: string | string[],
  value: any,
): any | undefined {
  let path: string[];
  if (Array.isArray(key)) {
    path = key;
  } else {
    path = keyToPathArray(key);
  }

  if (path.length > 0) {
    return setInViaPath(object, path, value);
  }

  return undefined;
}

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target: Record<string, any>, ...sources: any): Record<string, any> {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
