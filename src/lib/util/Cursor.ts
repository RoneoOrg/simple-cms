type CursorStore = {
  actions: string[];
  data: Record<string, Record<string, any>>;
  meta: Record<string, Record<string, any>>;
};

type ActionHandler = (action: string) => any;

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

function filterUnknownMetaKeys(meta?: Record<string, any>) {
  if (!meta) {
    return {};
  }

  return Object.keys(meta).reduce((acc, key) => {
    if (knownMetaKeys.has(key)) {
      acc[key] = meta[key];
    }
    return acc;
  }, {} as Record<string, any>);
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
    | [string[], Record<string, any>, Record<string, any>]
    | {
        actions?: string[];
        data?: Record<string, any>;
        meta?: Record<string, any>;
      },
): CursorStore {
  if (!args) {
    return {
      actions: [],
      data: {},
      meta: {},
    };
  }

  const { actions, data, meta } = Array.isArray(args)
    ? args.length === 1
      ? args[0]
      : { actions: args[0], data: args[1], meta: args[2] }
    : args;

  return {
    actions: [...new Set(actions ?? [])],
    data,
    meta: filterUnknownMetaKeys(meta),
  } as CursorStore;
}

function hasAction(store: CursorStore, action: string) {
  return store.actions.includes(action);
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
  store: CursorStore;
  actions: string[];
  data: Record<string, any>;
  meta: Record<string, any>;

  static create(
    args:
      | Cursor
      | [CursorStore]
      | [string[], Record<string, any>, Record<string, any>]
      | {
          actions?: string[];
          data?: Record<string, any>;
          meta?: Record<string, any>;
        },
  ) {
    if ((args as any)?.actions.length >= 4) {
      throw Error();
    }
    return new Cursor(args);
  }

  constructor(
    args:
      | Cursor
      | [CursorStore]
      | [string[], Record<string, any>, Record<string, any>]
      | {
          actions?: string[];
          data?: Record<string, any>;
          meta?: Record<string, any>;
        },
  ) {
    if (args instanceof Cursor) {
      this.store = args.store;
      this.actions = [...new Set(args.actions)];
      this.data = args.data;
      this.meta = args.meta;
      return;
    }

    this.store = createCursorStore(args);
    this.actions = [...new Set(this.store.actions)];
    this.data = this.store.data;
    this.meta = this.store.meta;
  }

  updateStore<K extends keyof CursorStore>(
    section: K,
    updater: (current: CursorStore[K]) => CursorStore[K],
  ) {
    const store = this.store!;
    let value: CursorStore[K];
    if (section === 'actions') {
      value = [...(store[section] as string[])] as CursorStore[K];
    } else {
      value = { ...store[section] };
    }

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
    return this.updateStore('actions', actions => [...new Set<string>(...actions, action)]);
  }

  removeAction(action: string) {
    return this.updateStore('actions', actions => {
      return [...new Set<string>(...actions.filter(a => a !== action))];
    });
  }

  setActions(actions: Iterable<string>) {
    return this.updateStore('actions', () => [...new Set<string>(actions)]);
  }

  mergeActions(actions: Set<string>) {
    return this.updateStore('actions', oldActions => [...new Set<string>(...oldActions, ...actions)]);
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
    return this.updateStore('data', (oldData: Record<string, any>) => {
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
    ] as [Record<string, any>, Cursor];
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
