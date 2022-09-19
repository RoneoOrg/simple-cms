type CursorStore = {
  actions: Set<string>;
  data: Record<string, Record<string, any>>;
  meta: Record<string, Record<string, any>>;
};

type ActionHandler = (action: string) => unknown;

const knownMetaKeys = new Set([
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

function filterUnknownMetaKeys(meta?: Record<string, unknown>) {
  if (!meta) {
    return {};
  }

  return Object.keys(meta).reduce((acc, key) => {
    if (knownMetaKeys.has(key)) {
      acc[key] = meta[key];
    }
    return acc;
  }, {} as Record<string, unknown>);
}

/*
  createCursorMap takes one of three signatures:
  - () -> cursor with empty actions, data, and meta
  - (cursorMap: <object/Map with optional actions, data, and meta keys>) -> cursor
  - (actions: <array/List>, data: <object/Map>, meta: <optional object/Map>) -> cursor
*/
function createCursorStore(
  args:
    | [CursorStore]
    | [Set<string>, Record<string, unknown>, Record<string, unknown>]
    | {
        actions?: Set<string>;
        data?: Record<string, unknown>;
        meta?: Record<string, unknown>;
      },
) {
  const { actions, data, meta } = Array.isArray(args)
    ? args.length === 1
      ? args[0]
      : { actions: args[0], data: args[1], meta: args[2] }
    : args;

  return {
    actions: new Set(actions),
    data,
    meta: filterUnknownMetaKeys(meta),
  } as CursorStore;
}

function hasAction(store: CursorStore, action: string) {
  return store.actions.has(action);
}

function getActionHandlers(store: CursorStore, handler: ActionHandler) {
  let actions: Record<string, any> = {};

  store.actions.forEach(action => {
    actions[action] = handler(action);
  });

  return actions;
}

// The cursor logic is entirely functional, so this class simply
// provides a chainable interface
export default class Cursor {
  store?: CursorStore;
  actions?: Set<string>;
  data?: Record<string, unknown>;
  meta?: Record<string, unknown>;

  static create(
    args:
      | Cursor
      | [CursorStore]
      | [Set<string>, Record<string, unknown>, Record<string, unknown>]
      | {
          actions?: Set<string>;
          data?: Record<string, unknown>;
          meta?: Record<string, unknown>;
        },
  ) {
    return new Cursor(args);
  }

  constructor(
    args:
      | Cursor
      | [CursorStore]
      | [Set<string>, Record<string, unknown>, Record<string, unknown>]
      | {
          actions?: Set<string>;
          data?: Record<string, unknown>;
          meta?: Record<string, unknown>;
        },
  ) {
    if (args instanceof Cursor) {
      return args as Cursor;
    }

    this.store = createCursorStore(args);
    this.actions = this.store.actions;
    this.data = this.store.data;
    this.meta = this.store.meta;
  }

  updateStore<K extends keyof CursorStore>(
    section: K,
    updater: (current: CursorStore[K]) => CursorStore[K],
  ) {
    const store = this.store!;
    const value = { ...store[section] };

    return new Cursor([
      {
        ...store,
        [section]: updater(value),
      },
    ]);
  }

  hasAction(action: string) {
    return hasAction(this.store!, action);
  }

  addAction(action: string) {
    return this.updateStore('actions', actions => actions.add(action));
  }

  removeAction(action: string) {
    return this.updateStore('actions', actions => {
      actions.delete(action);
      return actions;
    });
  }

  setActions(actions: Iterable<string>) {
    return this.updateStore('actions', () => new Set(actions));
  }

  mergeActions(actions: Set<string>) {
    return this.updateStore('actions', oldActions => new Set(...oldActions, ...actions));
  }

  getActionHandlers(handler: ActionHandler) {
    return getActionHandlers(this.store!, handler);
  }

  setData(data: Record<string, any>) {
    return this.updateStore('data', () => data);
  }

  mergeData(data: Record<string, any>) {
    return this.updateStore('data', oldData => {
      const newData = { ...oldData };

      Object.keys(data).forEach(key => {
        newData[key] = data[key];
      });

      return newData;
    });
  }

  wrapData(data: Record<string, any>) {
    return this.updateStore('data', (oldData: Record<string, unknown>) => {
      const newData = { ...data };
      newData['wrapped_cursor_data'] = oldData;
      return newData;
    });
  }

  unwrapData() {
    const state: CursorStore = { ...this.store!, data: { ...this.store!.data } };
    delete state.data['wrapped_cursor_data'];

    return [
      state,
      this.updateStore('data', (data: Record<string, any>) => data.wrapped_cursor_data),
    ] as [Record<string, unknown>, Cursor];
  }

  clearData() {
    return this.updateStore('data', () => ({}));
  }

  setMeta(meta: Record<string, any>) {
    return this.updateStore('meta', () => meta);
  }

  mergeMeta(meta: Record<string, any>) {
    return this.updateStore('meta', oldMeta => {
      const newMeta = { ...oldMeta };

      Object.keys(meta).forEach(key => {
        newMeta[key] = meta[key];
      });

      return newMeta;
    });
  }
}

// This is a temporary hack to allow cursors to be added to the
// interface between backend.js and backends without modifying old
// backends at all. This should be removed in favor of wrapping old
// backends with a compatibility layer, as part of the backend API
// refactor.
export const CURSOR_COMPATIBILITY_SYMBOL = Symbol('cursor key for compatibility with old backends');
