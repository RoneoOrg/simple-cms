/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, Map, fromJS as immutableFromJS } from "immutable";

import type { StaticallyTypedRecord } from "../core/types/immutable";

export function isT = any[](input: any): input is T[] {
  return List.isList(input);
}

export function isMap<T = any>(input: any): input is Record<string, T> {
  return Map.isMap(input);
}

export function toJS<T = any>(input: T[]): T[];
export function toJS<T = any>(input: Record<string, any>): T;
export function toJS<T>(input: T[] | Record<string, T>): any {
  return input;
}

export function toT = any[](input: T[]): T[] {
  return immutableFromJS(input) as any;
}

export function toMap(input: any): Record<string, any> {
  return immutableFromJS(input) as any;
}

export function toT(input: T): T {
  return immutableFromJS(input) as any;
}
