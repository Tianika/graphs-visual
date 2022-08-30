import { DragEvent, useEffect, useState } from 'react';
import { Coord, GraphsProps } from './utils/types';
import { useRefsArray } from './utils/utils';
import './Graphs.css';

const Graphs = ({ graphs }: GraphsProps) => {
  const [nodes, setNodes] = useState(graphs.nodes);
  const [graphForDraw, setGraphForDraw] = useState<number[][]>([]);
  const [lineCoords, setLineCoords] = useState<Coord[] | null>(null);
  const [startId, setStartId] = useState<number>();
  const [endId, setEndId] = useState<number>();

  const refs = useRefsArray(graphs.nodes.length);

  function getVertexes() {
    if (!graphs) return;

    const vertexes = [];

    const startVertexes = getStartVertex();
    vertexes.push(startVertexes);

    let nextVertexes = getNextVertex(startVertexes);

    while (nextVertexes.length) {
      vertexes.push(nextVertexes);
      nextVertexes = getNextVertex(nextVertexes);
    }

    setGraphForDraw(vertexes);
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

    const offsetX = refs[0].current?.getBoundingClientRect().x;
    const offsetY = refs[0].current?.getBoundingClientRect().y;

    graphs.edges.forEach(({ fromId, toId }) => {
      const pointLeft = refs[fromId].current?.getBoundingClientRect();
      const pointRight = refs[toId].current?.getBoundingClientRect();

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
      target.classList.add('drag');
    }

    setStartId(id);
  }

  function dragLeaveHandler(event: DragEvent<HTMLElement>) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      target.classList.remove('drop-zone');
    }

    setEndId(undefined);
  }

  function dragEndHandler(event: DragEvent<HTMLElement>) {
    const { target } = event;

    if (target instanceof HTMLElement) {
      target.classList.remove('drag');
    }

    if (startId !== undefined && endId !== undefined) {
      changeNodes(startId, endId);
    }
  }

  function dragOverHandler(event: DragEvent<HTMLElement>, id: number) {
    event.preventDefault();
    const { target } = event;

    if (target instanceof HTMLElement) {
      target.classList.add('drop-zone');
      setEndId(id);
    }
  }

  useEffect(() => {
    if (!graphs) return;

    getVertexes();
  }, [graphs]);

  useEffect(() => {
    getCoordsForLine();
  }, [graphForDraw]);

  return (
    <div className='graph-container'>
      <div className='graphs'>
        {graphForDraw.length > 0 &&
          graphForDraw.map((row, rowIndex) => {
            return (
              <div key={`row${rowIndex}`} className='vertex-column'>
                {row.map((vertex) => {
                  if (!graphs) return null;

                  const { id, name } = nodes[vertex];

                  return (
                    <div
                      key={id + name}
                      className='vertex'
                      draggable
                      ref={refs[id]}
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
