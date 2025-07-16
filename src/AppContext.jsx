import { createContext } from 'react';

export const AppContext = createContext({
  isWeighted: false,
  activeNode: null,
  activeEdge: null,
  nodeStates: {},
  edgeStates: {},
  logMessages: [],
  setNodeState: () => {},
  setEdgeState: () => {},
  addLogMessage: () => {},
  clearLog: () => {},
});