import { Map, Set } from 'immutable';

import { toStaticallyTypedRecord, toMap } from '../../util/ImmutableUtil';

type CursorStoreObject = {
  actions: Set<string>;
  data: Record<string, unknown>;
  meta: Record<string, unknown>;
};

export type CursorStore = {
  get<K extends keyof CursorStoreObject>(
    key: K,
    defaultValue?: CursorStoreObject[K],
  ): CursorStoreObject[K];
  getIn<V>(path: string[]): V;
  set<K extends keyof CursorStoreObject, V extends CursorStoreObject[K]>(
    key: K,
    value: V,
  ): CursorStoreObject[K];
  setIn(path: string[], value: unknown): CursorStore;
  hasIn(path: string[]): boolean;
  mergeIn(path: string[], value: unknown): CursorStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => CursorStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateIn: (...args: any[]) => CursorStore;
};

type ActionHandler = (action: string) => unknown;

function jsToMap(obj: {}) {
  if (obj === undefined) {
    return {};
  }
  const immutableObj = toMap(obj);
  if (!Map.isMap(immutableObj)) {
    throw new Error('Object must be equivalent to a Map.');
  }
  return immutableObj;
}

const knownMetaKeys = Set([
  'index',
  'page',
  'count',
  'pageSize',
  'pageCount',
  'usingOldPaginationAPI',
  'extension',
  'folder',
  'depth',
]);

function filterUnknownMetaKeys(meta: Record<string, string>) {
  return meta.filter((_v, k) => knownMetaKeys.has(k as string));
}

/*
  createCursorMap takes one of three signatures:
  - () -> cursor with empty actions, data, and meta
  - (cursorMap: <object/Map with optional actions, data, and meta keys>) -> cursor
  - (actions: <array/List>, data: <object/Map>, meta: <optional object/Map>) -> cursor
*/
function createCursorStore(...args: {}[]) {
  const { actions, data, meta } =
    args.length === 1
      ? jsToMap(args[0]).toObject()
      : { actions: args[0], data: args[1], meta: args[2] };
  return Map({
    // actions are a Set, rather than a List, to ensure an efficient .has
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: Set(actions as any),

    // data and meta are Maps
    data: jsToMap(data as any),
    meta: jsToMap(meta as any).update(filterUnknownMetaKeys as any),
  }) as CursorStore;
}

function hasAction(store: CursorStore, action: string) {
  return store.hasIn(['actions', action]);
}

function getActionHandlers(store: CursorStore, handler: ActionHandler) {
  return store
    .get('actions', Set<string>())
    .toMap()
    .map(action => handler(action as string));
}

// The cursor logic is entirely functional, so this class simply
// provides a chainable interface
export default class Cursor {
  store?: CursorStore;
  actions?: Set<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;

  static create(...args: {}[]) {
    return new Cursor(...args);
  }

  constructor(...args: {}[]) {
    if (args[0] instanceof Cursor) {
      return args[0] as Cursor;
    }

    this.store = createCursorStore(...args);
    this.actions = this.store.actions;
    this.data = this.store.data;
    this.meta = this.store.meta;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStore(...args: any[]) {
    return new Cursor(this.store!.update(...args));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateInStore(...args: any[]) {
    return new Cursor(this.store!.updateIn(...args));
  }

  hasAction(action: string) {
    return hasAction(this.store!, action);
  }
  addAction(action: string) {
    return this.updateStore('actions', (actions: Set<string>) => actions.add(action));
  }
  removeAction(action: string) {
    return this.updateStore('actions', (actions: Set<string>) => actions.delete(action));
  }
  setActions(actions: Iterable<string>) {
    return this.updateStore((store: CursorStore) => store.set('actions', Set<string>(actions)));
  }
  mergeActions(actions: Set<string>) {
    return this.updateStore('actions', (oldActions: Set<string>) => oldActions.union(actions));
  }
  getActionHandlers(handler: ActionHandler) {
    return getActionHandlers(this.store!, handler);
  }

  setData(data: {}) {
    return new Cursor(this.store!.set('data', jsToMap(data) as any));
  }
  mergeData(data: {}) {
    return new Cursor(this.store!.mergeIn(['data'], jsToMap(data)));
  }
  wrapData(data: {}) {
    return this.updateStore('data', (oldData: Record<string, unknown>) =>
      jsToMap(data).set('wrapped_cursor_data', oldData),
    );
  }
  unwrapData() {
    return [
      this.store!.data.delete('wrapped_cursor_data'),
      this.updateStore('data', (data: Record<string, unknown>) => data.wrapped_cursor_data),
    ] as [Record<string, unknown>, Cursor];
  }
  clearData() {
    return this.updateStore('data', () => {});
  }

  setMeta(meta: {}) {
    return this.updateStore((store: CursorStore) => store.set('meta', jsToMap(meta) as any));
  }
  mergeMeta(meta: {}) {
    return this.updateStore((store: CursorStore) =>
      store.update('meta', (oldMeta: Record<string, unknown>) => oldMeta.merge(jsToMap(meta))),
    );
  }
}

// This is a temporary hack to allow cursors to be added to the
// interface between backend.js and backends without modifying old
// backends at all. This should be removed in favor of wrapping old
// backends with a compatibility layer, as part of the backend API
// refactor.
export const CURSOR_COMPATIBILITY_SYMBOL = Symbol('cursor key for compatibility with old backends');
