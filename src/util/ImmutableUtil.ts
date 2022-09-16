/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, Map, fromJS as immutableFromJS } from "immutable";

import type { StaticallyTypedRecord } from "../netlify-cms-core/types/immutable";

export function isList<T = any>(input: any): input is List<T> {
  return List.isList(input);
}

export function isMap<T = any>(input: any): input is Map<string, T> {
  return Map.isMap(input);
}

export function toJS<T = any>(input: List<T>): T[];
export function toJS<T = any>(input: Map<string, any>): T;
export function toJS<T>(input: List<T> | Map<string, T>): any {
  return input.toJS();
}

export function toList<T = any>(input: T[]): List<T> {
  return immutableFromJS(input) as any;
}

export function toMap(input: any): Map<string, any> {
  return immutableFromJS(input) as any;
}

export function toStaticallyTypedRecord<T>(input: T): StaticallyTypedRecord<T> {
  return immutableFromJS(input) as any;
}
