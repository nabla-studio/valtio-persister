export interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

export type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown;
  replacer?: (key: string, value: unknown) => unknown;
};

export type StorageValue<S> = {
  state: S;
  version?: number;
};

export interface PersistStorage<S> {
  getItem: (
    name: string
  ) => StorageValue<S> | null | Promise<StorageValue<S> | null>;
  setItem: (name: string, value: StorageValue<S>) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

export type PersistListener<S> = (state: S) => void;

export interface PersisterOptions<T extends object> {
  name: string;
  version?: number;
  skipHydration?: boolean;
  storage?: PersistStorage<T>;
  partialize?: (state: T) => T;
  onRehydrateStorage?: (
    state: T
  ) => ((state?: T, error?: Error) => void) | void;
  migrate?: (persistedState: T, version: number) => T | Promise<T>;
  merge?: (persistedState: T, currentState: T) => T;
}
