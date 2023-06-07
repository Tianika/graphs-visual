import { ChangeEvent, useEffect, useState } from 'react';
import { fetchGraphs } from './utils/api';
import Graphs from './Graphs';
import './App.css';
import { DEFAULT_OPTION, DEFAULT_OPTION_STRING } from './utils/constants';
import { Graph } from './utils/types';

function App() {
  const [graphsList, setGraphsList] = useState<number[] | null>(null);
  const [graphs, setGraphs] = useState<Graph | null>(null);

  async function getGraph(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setGraphs(null);

    if (value === DEFAULT_OPTION) {
      return;
    }

    const data = await fetchGraphs(`/api/graphs/${value}`);
    setGraphs(data);
  }

  async function getGraphsList() {
    const data = await fetchGraphs('/api/graphs');

    setGraphsList(data);
  }

  useEffect(() => {
    setTimeout(() => getGraphsList(), 1000);
  }, []);

  return (
    <div className='app'>
      {!graphsList && <div>Loading...</div>}
      {graphsList && (
        <select onChange={getGraph}>
          <option value={DEFAULT_OPTION}>{DEFAULT_OPTION_STRING}</option>
          {graphsList.map((item) => {
            return (
              <option key={item} value={item}>
                {item}
              </option>
            );
          })}
        </select>
      )}
      {graphs && <Graphs graphs={graphs} />}
    </div>
  );
}

export default App;
