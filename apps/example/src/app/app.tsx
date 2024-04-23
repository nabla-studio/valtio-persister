import { useSnapshot } from 'valtio';
import { proxyWithPersister } from 'valtio-persister';

const { store } = proxyWithPersister(
  {
    counter: 0,
  },
  {
    name: 'test',
  }
);

const increment = () => {
  ++store.counter;
};

export function App() {
  const snap = useSnapshot(store);

  return (
    <div>
      count: {snap.counter}
      <button onClick={increment}>+</button>
    </div>
  );
}

export default App;
