export interface GraphsList {
  graphs: number[]; // IDs of the available graphs
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type GraphEdge = {
  fromId: number; // Id of the node from which the edge starts
  toId: number; // Id of the node to which the edge leads
};

export type GraphNode = {
  id: number; // Unique id of the node
  name: string; // String name of the node which should be displayed
};

export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type GraphsProps = {
  graphs: Graph;
};
