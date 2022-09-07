import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Coord, GraphsProps } from './utils/types';
import './Graphs.css';

const Graphs = ({ graphs }: GraphsProps) => {
  const [nodes, setNodes] = useState(graphs.nodes);
  const [lineCoords, setLineCoords] = useState<Coord[] | null>(null);
  const [startId, setStartId] = useState<number>();
  const [endId, setEndId] = useState<number>();
  const [dragId, setDragId] = useState<number>();
  const [dropId, setDropId] = useState<number>();

  const refs = useRef<(HTMLDivElement | null)[]>([]);

  function getVertexes() {
    const vertexes: number[][] = [];

    const startVertexes = getStartVertex();
    vertexes.push(startVertexes);

    let nextVertexes = getNextVertex(startVertexes);

    while (nextVertexes.length) {
      vertexes.push(nextVertexes);
      nextVertexes = getNextVertex(nextVertexes);
    }

    return vertexes;
  }

  function getStartVertex() {
    const startVertexes = new Set(graphs.edges.map((edge) => edge.fromId));

    Array.from(startVertexes).map((point) => {
      if (graphs.edges.findIndex((edge) => edge.toId === point) > -1) {
        startVertexes.delete(point);
      }
    });

    return [...startVertexes];
  }

  function getNextVertex(vertexes: number[]) {
    const nextVertexes: number[] = [];

    graphs.edges.forEach(({ fromId, toId }) => {
      if (vertexes.includes(fromId)) {
        nextVertexes.push(toId);
      }
    });

    return Array.from(new Set(nextVertexes));
  }

  function getCoordsForLine() {
    const newCoords: Coord[] = [];

    const offsetX = refs.current[0]?.getBoundingClientRect().x;
    const offsetY = refs.current[0]?.getBoundingClientRect().y;

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

  function changeNodes(startId: number, endId: number) {
    const newNodes = [...nodes];

    const startName = newNodes[startId].name;
    const endName = newNodes[endId].name;

    newNodes[startId].name = endName;
    newNodes[endId].name = startName;

    setNodes(newNodes);
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

  function dragEndHandler(event: DragEvent<HTMLElement>) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      setDragId(undefined);
      setDropId(undefined);
    }

    if (startId !== undefined && endId !== undefined) {
      changeNodes(startId, endId);
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

  const graphForDraw = useMemo(getVertexes, []);

  useEffect(getCoordsForLine, [graphForDraw]);

  return (
    <div className='graph-container'>
      <div className='graphs'>
        {graphForDraw &&
          graphForDraw.map((column, columnIndex) => {
            return (
              <div key={`column${columnIndex}`} className='vertex-column'>
                {column.map((vertex) => {
                  if (!graphs) return null;

                  const { id, name } = nodes[vertex];

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
                      onDragEnd={dragEndHandler}
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
