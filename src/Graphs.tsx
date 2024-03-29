import { DragEvent, useLayoutEffect, useRef, useState } from 'react';
import { Coord, GraphsProps, Graph, GraphNodeMap, NodesMap } from './utils/types';
import './Graphs.css';

const Graphs = ({ graphs }: GraphsProps) => {
  const [graphForDraw, setGraphForDraw] = useState<number[][] | null>(null);
  const [lineCoords, setLineCoords] = useState<Coord[] | null>(null);
  const [startId, setStartId] = useState<number>();
  const [endId, setEndId] = useState<number>();
  const [dragId, setDragId] = useState<number>();
  const [dropId, setDropId] = useState<number>();
  const [nodesMap, setNodesMap] = useState<NodesMap>();

  const refs = useRef<(HTMLDivElement | null)[]>([]);

  function getNodesMap() {
    const nodes: NodesMap = graphs.nodes.reduce(
      (acc, { id, name }) => ({
        ...acc,
        [id]: { name, toId: [], fromId: [], weight: 0 },
      }),
      {}
    );

    graphs.edges.forEach(({ fromId, toId }) => {
      nodes[fromId].toId.push(toId);
      nodes[toId].fromId.push(fromId);
      nodes[toId].weight += 1;
    });

    return nodes;
  }

  function getVertexes() {
    const vertexes: number[][] = [];
    const startVertexes = getStartVertexes();

    vertexes.push(startVertexes);

    let nextVertexes = getNextVertexes(startVertexes);

    while (nextVertexes.length) {
      vertexes.push(nextVertexes);
      nextVertexes = getNextVertexes(nextVertexes);
    }

    return vertexes;
  }

  function getStartVertexes() {
    const startVertexes: number[] = [];

    if (nodesMap) {
      Object.entries(nodesMap).forEach(([key, value]) => {
        if (value.weight === 0) {
          startVertexes.push(+key);
        }
      });
    }

    return [...startVertexes];
  }

  function getNextVertexes(startVertexes: number[]) {
    const nextVertexes: number[] = [];

    if (!nodesMap) return [];

    startVertexes.forEach((startVertex) => {
      const vertexes = nodesMap[startVertex].toId;

      if (vertexes.length < 2) {
        nextVertexes.push(...vertexes);
      } else {
        nextVertexes.push(...vertexes.sort((a, b) => nodesMap[a].weight - nodesMap[b].weight));
      }
    });

    return [...new Set(nextVertexes)];
  }

  function getCoordsForLine() {
    if (!graphForDraw) return;

    const newCoords: Coord[] = [];
    const startIndex = graphForDraw[0][0];

    const offsetX = refs.current[startIndex]?.getBoundingClientRect().x;
    const offsetY = refs.current[startIndex]?.getBoundingClientRect().y;

    graphs.edges.forEach(({ fromId, toId }) => {
      const pointLeft = refs.current[fromId]?.getBoundingClientRect();
      const pointRight = refs.current[toId]?.getBoundingClientRect();

      if (pointLeft && pointRight && offsetX && offsetY) {
        const x1 = pointLeft.right - offsetX;
        const y1 = pointLeft.top - offsetY + pointRight.height / 2;

        const x2 = pointRight.left - offsetX;
        const y2 = pointRight.top - offsetY + pointRight.height / 2;

        newCoords.push({
          x1,
          y1,
          x2,
          y2,
        });
      }
    });

    setLineCoords(newCoords);
  }

  function changeNodes(startId: number, endId: number, columnIndex: number) {
    if (!graphForDraw) return;

    const newGraphsForDraw = [...graphForDraw];
    const column = newGraphsForDraw[columnIndex];
    newGraphsForDraw[columnIndex] = column.map((vertex) => {
      return vertex === startId ? endId : vertex === endId ? startId : vertex;
    });

    return newGraphsForDraw;
  }

  function dragStartHandler(event: DragEvent<HTMLElement>, id: number) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      setDragId(id);
    }

    setStartId(id);
  }

  function dragLeaveHandler(event: DragEvent<HTMLElement>) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      setDropId(undefined);
    }

    setEndId(undefined);
  }

  function dragEndHandler(event: DragEvent<HTMLElement>, columnIndex: number) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      setDragId(undefined);
      setDropId(undefined);
    }

    if (startId !== undefined && endId !== undefined) {
      const newGraph = changeNodes(startId, endId, columnIndex);

      if (newGraph) {
        setGraphForDraw(newGraph);
      }
    }
  }

  function dragOverHandler(event: DragEvent<HTMLElement>, id: number) {
    event.preventDefault();
    const { target } = event;

    if (target instanceof HTMLElement) {
      setDropId(id);
      setEndId(id);
    }
  }

  useLayoutEffect(() => {
    setNodesMap(getNodesMap());
  }, [graphs]);
  useLayoutEffect(() => {
    setGraphForDraw(getVertexes());
  }, [nodesMap]);
  useLayoutEffect(getCoordsForLine, [graphForDraw]);

  return (
    <div className='graph-container'>
      <div className='graphs'>
        {graphForDraw &&
          graphForDraw.map((column, columnIndex) => {
            return (
              <div key={`column${columnIndex}`} className='vertex-column'>
                {column.map((vertex) => {
                  if (!graphs) return null;

                  const { id, name } = graphs.nodes[vertex];

                  return (
                    <div
                      key={id + name}
                      className={`vertex ${dragId === id ? 'drag' : ''} ${
                        dropId === id ? 'drop-zone' : ''
                      }`}
                      draggable
                      ref={(el) => (refs.current[id] = el)}
                      onDragStart={(event) => dragStartHandler(event, id)}
                      onDragLeave={(event) => dragLeaveHandler(event)}
                      onDragEnd={(event) => dragEndHandler(event, columnIndex)}
                      onDragOver={(event) => dragOverHandler(event, id)}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      <svg className='lines'>
        {lineCoords &&
          lineCoords.map(({ x1, y1, x2, y2 }) => {
            return (
              <line
                key={`line${x1}${y1}${x2}${y2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke='black'
              />
            );
          })}
      </svg>
    </div>
  );
};

export default Graphs;
