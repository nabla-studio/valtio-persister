import type {
  JsonStorageOptions,
  PersistStorage,
  PersisterOptions,
  StateStorage,
  StorageValue,
} from './types';
import { proxy, subscribe } from 'valtio';

/**
 * The original implementation is available here: https://github.com/pmndrs/zustand/blob/main/src/middleware/persist.ts#L31
 *
 * I took it directly from zustand and imported it here to avoid having zustand as a dependency in this package
 */
export function createJSONStorage<T>(
  getStorage: () => StateStorage,
  options?: JsonStorageOptions
): PersistStorage<T> | undefined {
  let storage: StateStorage | undefined;

  try {
    storage = getStorage();
  } catch (e) {
    // prevent error if the storage is not defined (e.g. when server side rendering a page)
    return;
  }

  const persistStorage: PersistStorage<T> = {
    getItem: (name) => {
      const parse = (str: string | null) => {
        if (str === null) {
          return null;
        }
        return JSON.parse(str, options?.reviver) as StorageValue<T>;
      };

      const str = (storage as StateStorage).getItem(name) ?? null;

      if (str instanceof Promise) {
        return str.then(parse);
      }

      return parse(str);
    },
    setItem: (name, newValue) =>
      (storage as StateStorage).setItem(
        name,
        JSON.stringify(newValue, options?.replacer)
      ),
    removeItem: (name) => (storage as StateStorage).removeItem(name),
  };
  return persistStorage;
}

export const proxyWithPersister = <T extends object>(
  state: T,
  baseOptions: PersisterOptions<T>
) => {
  const options = {
    storage: createJSONStorage<T>(() => localStorage),
    partialize: (state: T) => state,
    version: 0,
    merge: (persistedState: T, currentState: T) => ({
      ...currentState,
      ...persistedState,
    }),
    ...baseOptions,
  };

  const storage = options.storage;
  const name = options.name;

  if (!storage) {
    console.warn(
      `[valtio persister] Unable to update item '${options.name}', the given storage is currently unavailable.`
    );
  }

  const store = proxy(state);

  const setItem = () => {
    const state = options.partialize({ ...store });

    if (!storage) return;

    return storage.setItem(options.name, {
      state,
      version: options.version,
    });
  };

  const migrate = async () => {
    if (!storage) return;

    const deserializedStorageValue = await storage.getItem(options.name);

    if (
      deserializedStorageValue &&
      typeof deserializedStorageValue.version === 'number' &&
      deserializedStorageValue.version !== options.version
    ) {
      if (options.migrate) {
        return options.migrate(
          deserializedStorageValue.state,
          deserializedStorageValue.version
        );
      }
      console.error(
        `State loaded from storage couldn't be migrated since no migrate function was provided`
      );
    }

    return deserializedStorageValue?.state;
  };

  const hydrate = async () => {
    if (!storage) return;

    const postRehydrationCallback =
      options.onRehydrateStorage?.(store) || undefined;

    try {
      const migratedState = await migrate();

      const stateFromStorage = options.merge(migratedState as T, store);

      Object.keys(stateFromStorage).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        store[key] = stateFromStorage[key];
      });

      postRehydrationCallback?.(stateFromStorage, undefined);
    } catch (e) {
      postRehydrationCallback?.(undefined, e as Error);
    }
  };

  if (name) {
    subscribe(store, setItem);
  } else {
    console.warn(`[valtio persister] you need to specify a storage name.`);
  }

  if (!options.skipHydration) {
    hydrate();
  }

  return {
    store,
    options,
    hydrate,
  };
};
