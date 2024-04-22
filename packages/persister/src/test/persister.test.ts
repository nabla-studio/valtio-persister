import { proxyWithPersister } from '../persister';

const initialState = {
  testKey: 'testValue',
};
const persisterName = 'test-storage';

describe('proxyWithPersister', () => {
  test('proxyWithPersister should persist data on localStorage', async () => {
    const { store } = proxyWithPersister(initialState, {
      name: persisterName,
    });

    store.testKey = 'testValueMutated';

    await Promise.resolve();

    expect(store).toStrictEqual({ testKey: 'testValueMutated' });
    expect(localStorage.getItem(persisterName)).toStrictEqual(
      JSON.stringify({
        state: { testKey: 'testValueMutated' },
        version: 0,
      })
    );
    expect(localStorage.length).toBe(1);
  });
  test('proxyWithPersister should hydrate data from localStorage', async () => {
    const { store } = proxyWithPersister(initialState, {
      name: persisterName,
    });

    await Promise.resolve();

    expect(store).toStrictEqual({ testKey: 'testValueMutated' });
    expect(localStorage.getItem(persisterName)).toStrictEqual(
      JSON.stringify({
        state: { testKey: 'testValueMutated' },
        version: 0,
      })
    );
    expect(localStorage.length).toBe(1);
  });
  test('proxyWithPersister should not persist excluded keys to localStorage', async () => {
    const excludedKeys = ['excludedKey'];

    const state = {
      ...initialState,
      excludedKey: 'excludeValue',
    };

    const { store } = proxyWithPersister(state, {
      name: persisterName,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !excludedKeys.includes(key))
        ) as typeof state,
    });

    store.testKey = 'testValueMutated2';

    await Promise.resolve();

    expect(store).toStrictEqual({ ...state, testKey: 'testValueMutated2' });
    expect(localStorage.getItem(persisterName)).toStrictEqual(
      JSON.stringify({
        state: { testKey: 'testValueMutated2' },
        version: 0,
      })
    );
    expect(localStorage.length).toBe(1);
  });
});
