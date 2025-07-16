import React, { useCallback, useState, useEffect } from 'react';
import {
  Background,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CustomConnectionLine';
import Menu from './Menu';
import LogInputModal from './LogInputModal';
import GraphInputModal from './GraphInputModal';
import PlaybackControls from './PlaybackControls';
import LogPanel from './LogPanel';
import { AppContext } from './AppContext';

const initialNodes = [];
const initialEdges = [];

const connectionLineStyle = { stroke: '#b1b1b7' };

const nodeTypes = { custom: CustomNode };
const edgeTypes = { floating: FloatingEdge };
const defaultEdgeOptions = {
  type: 'floating',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' },
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [graphInput, setGraphInput] = useState('');
  const [isPaused, setIsPaused] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [logSteps, setLogSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [nodeStates, setNodeStates] = useState({});
  const [edgeStates, setEdgeStates] = useState({});
  const [logMessages, setLogMessages] = useState([]);
  const { screenToFlowPosition, getViewport } = useReactFlow();

  const getNextNodeId = useCallback(() => {
    const existingIds = nodes.map((node) => parseInt(node.id, 10)).sort((a, b) => a - b);
    let nextId = 0;
    for (let id of existingIds) {
      if (id !== nextId) break;
      nextId++;
    }
    return nextId.toString();
  }, [nodes]);

  const getNextEdgeIds = useCallback((count = 1) => {
    const existingIds = edges
      .map((edge) => {
        const match = edge.id.match(/^edge-(\d+)$/);
        return match ? parseInt(match[1], 10) : -1;
      })
      .filter((id) => id !== -1)
      .sort((a, b) => a - b);

    const ids = [];
    let nextId = 0;
    for (let i = 0; i < count; i++) {
      while (existingIds.includes(nextId)) nextId++;
      ids.push(`edge-${nextId}`);
      nextId++;
    }
    return ids;
  }, [edges]);

  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) return;
      setEdges((eds) => {
        const edgeIds = getNextEdgeIds(isDirected ? 1 : 2);
        const pairId = isDirected ? null : [params.source, params.target].sort().join('-');
        const newEdge = { ...params, id: edgeIds[0], data: { weight: 0, undirectedPairId: pairId } };
        let newEdges = addEdge(newEdge, eds);

        if (!isDirected) {
          const reverseEdge = {
            id: edgeIds[1],
            source: params.target,
            target: params.source,
            type: 'floating',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' },
            data: { weight: 0, undirectedPairId: pairId },
          };
          newEdges = addEdge(reverseEdge, newEdges);
        }

        return newEdges;
      });
    },
    [setEdges, isDirected, getNextEdgeIds]
  );

  const onPaneClick = useCallback(
    (event) => {
      if (!isCreateMode) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const nodeWidth = 50;
      const nodeHeight = 50;
      const newNode = {
        id: getNextNodeId(),
        type: 'custom',
        position: { x: position.x - nodeWidth / 2, y: position.y - nodeHeight / 2 },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [isCreateMode, setNodes, screenToFlowPosition, getNextNodeId]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (!isDeleteMode) return;
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    },
    [isDeleteMode, setNodes, setEdges]
  );

  const onClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setIsDirected(false);
    setLogSteps([]);
    setCurrentStep(0);
    setNodeStates({});
    setEdgeStates({});
    setLogMessages([]);
    setIsPaused(true);
  }, [setNodes, setEdges]);

  const executeStep = useCallback(
    (stepIndex) => {
      if (stepIndex < 0 || stepIndex >= logSteps.length) return;
      const step = logSteps[stepIndex];
      const { command, args } = step;

      switch (command) {
        case 'visit':
          setNodeStates((prev) => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach((key) => {
              newStates[key] = {
                ...newStates[key],
                visit: false,
                color: newStates[key].savedColor || undefined,
                visited: newStates[key].savedVisited || false,
                inQueue: newStates[key].savedInQueue || false,
              };
            });
            const currentNode = newStates[args[0]] || {};
            newStates[args[0]] = {
              ...currentNode,
              visit: true,
              savedColor: currentNode.color,
              savedVisited: currentNode.visited || false,
              savedInQueue: currentNode.inQueue || false,
              color: undefined,
              visited: false,
              inQueue: false,
            };
            return newStates;
          });
          break;
        case 'colorNode':
          setNodeStates((prev) => {
            const node = prev[args[0]] || {};
            return {
              ...prev,
              [args[0]]: {
                ...node,
                color: args[1],
                visit: false,
                savedColor: undefined,
                savedVisited: node.visited || false,
                savedInQueue: node.inQueue || false,
                visited: node.visited || false,
                inQueue: node.inQueue || false,
              },
            };
          });
          break;
        case 'colorEdge':
          setEdgeStates((prev) => {
            const edge = edges.find((e) => e.source === args[0] && e.target === args[1]);
            if (!edge) return prev;
            const newStates = { ...prev, [edge.id]: { ...prev[edge.id], color: args[2] } };
            if (!isDirected && edge.data?.undirectedPairId) {
              const reverseEdge = edges.find((e) => e.id !== edge.id && e.data.undirectedPairId === edge.data.undirectedPairId);
              if (reverseEdge) {
                newStates[reverseEdge.id] = { ...prev[reverseEdge.id], color: args[2] };
              }
            }
            return newStates;
          });
          break;
        case 'highlightNode':
          setNodeStates((prev) => ({
            ...prev,
            [args[0]]: { ...prev[args[0]], highlight: true },
          }));
          break;
        case 'unhighlightNode':
          setNodeStates((prev) => {
            const node = prev[args[0]] || {};
            return {
              ...prev,
              [args[0]]: {
                ...node,
                highlight: false,
                visit: false,
                visited: false,
                inQueue: false,
                color: undefined,
                savedColor: undefined,
                savedVisited: false,
                savedInQueue: false,
              },
            };
          });
          break;
        case 'highlightEdge':
          setEdgeStates((prev) => {
            const edge = edges.find((e) => e.source === args[0] && e.target === args[1]);
            if (!edge) return prev;
            const newStates = { ...prev, [edge.id]: { ...prev[edge.id], highlight: true, color: 'var(--color-primary)', markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } } };
            if (!isDirected && edge.data?.undirectedPairId) {
              const reverseEdge = edges.find((e) => e.id !== edge.id && e.data.undirectedPairId === edge.data.undirectedPairId);
              if (reverseEdge) {
                newStates[reverseEdge.id] = { ...prev[reverseEdge.id], highlight: true, color: 'var(--color-primary)', markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' } };
              }
            }
            return newStates;
          });
          break;
        case 'unhighlightEdge':
          setEdgeStates((prev) => {
            const edge = edges.find((e) => e.source === args[0] && e.target === args[1]);
            if (!edge) return prev;
            const newStates = { ...prev, [edge.id]: { ...prev[edge.id], highlight: false, color: undefined, markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' } } };
            if (!isDirected && edge.data?.undirectedPairId) {
              const reverseEdge = edges.find((e) => e.id !== edge.id && e.data.undirectedPairId === edge.data.undirectedPairId);
              if (reverseEdge) {
                newStates[reverseEdge.id] = { ...prev[reverseEdge.id], highlight: false, color: undefined, markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' } };
              }
            }
            return newStates;
          });
          break;
        case 'clearHighlights':
          setNodeStates((prev) => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach((key) => {
              newStates[key] = {
                ...newStates[key],
                highlight: false,
                visit: false,
                visited: false,
                inQueue: false,
                color: undefined,
                savedColor: undefined,
                savedVisited: false,
                savedInQueue: false,
              };
            });
            return newStates;
          });
          setEdgeStates((prev) => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach((key) => {
              newStates[key] = { ...prev[key], highlight: false, color: undefined, markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' } };
            });
            return newStates;
          });
          break;
        case 'markVisited':
          setNodeStates((prev) => {
            const node = prev[args[0]] || {};
            return {
              ...prev,
              [args[0]]: {
                ...node,
                visited: true,
                visit: false,
                color: '#00cc00',
                savedColor: undefined,
                savedVisited: true,
                savedInQueue: node.inQueue || false,
                inQueue: node.inQueue || false,
              },
            };
          });
          break;
        case 'markInQueue':
          setNodeStates((prev) => {
            const node = prev[args[0]] || {};
            return {
              ...prev,
              [args[0]]: {
                ...node,
                inQueue: true,
                visit: false,
                color: '#ffd700',
                savedColor: undefined,
                savedVisited: node.visited || false,
                savedInQueue: true,
              },
            };
          });
          break;
        case 'setNodeId':
          setNodeStates((prev) => ({
            ...prev,
            [args[0]]: { ...prev[args[0]], text: args[1] },
          }));
          break;
        case 'setEdgeWeight':
          setEdges((eds) => {
            const edge = eds.find((e) => e.source === args[0] && e.target === args[1]);
            if (!edge) return eds;
            const newWeight = parseFloat(args[2]) || 0;
            const newEdges = eds.map((e) =>
              e.id === edge.id
                ? { ...e, data: { ...e.data, weight: newWeight } }
                : e
            );
            if (!isDirected && edge.data?.undirectedPairId) {
              const reverseEdge = eds.find((e) => e.id !== edge.id && e.data.undirectedPairId === edge.data.undirectedPairId);
              if (reverseEdge) {
                return newEdges.map((e) =>
                  e.id === reverseEdge.id
                    ? { ...e, data: { ...e.data, weight: newWeight } }
                    : e
                );
              }
            }
            return newEdges;
          });
          break;
        case 'log':
          setLogMessages((prev) => [...prev, { text: args.join(' '), type: 'info' }]);
          break;
        case 'clearLog':
          setLogMessages([]);
          break;
        default:
          setLogMessages((prev) => [...prev, { text: `Ошибка: неизвестная команда "${step.raw}"`, type: 'error' }]);
          setLogSteps([]);
          setCurrentStep(0);
          setIsPaused(true);
          break;
      }
    },
    [logSteps, edges, isDirected, setNodeStates, setEdgeStates, setEdges, setLogMessages, setLogSteps, setCurrentStep, setIsPaused]
  );

  const handleNextStep = useCallback(() => {
    if (currentStep < logSteps.length) {
      executeStep(currentStep);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, logSteps, executeStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setNodeStates({});
      setEdgeStates({});
      for (let i = 0; i < currentStep - 1; i++) {
        executeStep(i);
      }
    }
  }, [currentStep, executeStep, setNodeStates, setEdgeStates]);

  const handlePause = useCallback((paused) => {
    setIsPaused(paused);
    if (!paused && currentStep >= logSteps.length) {
      setCurrentStep(0);
      setNodeStates({});
      setEdgeStates({});
      setLogMessages([]);
    }
  }, [logSteps, currentStep, setNodeStates, setEdgeStates, setLogMessages]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setNodeStates({});
    setEdgeStates({});
    setLogMessages([]);
    setIsPaused(true);
  }, [setNodeStates, setEdgeStates, setLogMessages]);

  const handleSpeedChange = useCallback((speed) => {
    setAnimationSpeed(speed);
  }, []);

  const handleCreateModeChange = useCallback((mode) => {
    setIsCreateMode(mode);
  }, []);

  const handleDeleteModeChange = useCallback((mode) => {
    setIsDeleteMode(mode);
  }, []);

  const handleDirectedChange = useCallback((mode) => {
    setIsDirected(mode);
  }, []);

  const handleWeightedChange = useCallback((mode) => {
    setIsWeighted(mode);
  }, []);

  const handleLogModalOpen = useCallback(() => {
    setIsLogModalOpen(true);
  }, []);

  const handleLogModalClose = useCallback(() => {
    setIsLogModalOpen(false);
  }, []);

  const handleLogSubmit = useCallback((logContent) => {
    const steps = logContent.split('\n').map((line) => {
      const [command, ...args] = line.trim().split(' ');
      return { command, args, raw: line.trim() };
    });
    setLogSteps(steps);
    setCurrentStep(0);
    setNodeStates({});
    setEdgeStates({});
    setLogMessages([]);
    setIsLogModalOpen(false);
    setIsPaused(true);
  }, []);

  const handleGraphModalOpen = useCallback(() => {
    setIsGraphModalOpen(true);
  }, []);

  const handleGraphModalClose = useCallback(() => {
    setIsGraphModalOpen(false);
  }, []);

  const handleGraphSubmit = useCallback((content) => {
    setGraphInput(content);
    const lines = content.trim().split('\n');
    const [n, m] = lines[0].split(' ').map(Number);
    const edges = lines.slice(1).map((line) => line.split(' ').map(Number));

    setNodes([]);
    setEdges([]);

    const { x, y, zoom } = getViewport();
    const pane = document.querySelector('.react-flow__pane');
    const { width, height } = pane.getBoundingClientRect();

    const minX = -x / zoom;
    const minY = -y / zoom;
    const maxX = (width - x) / zoom;
    const maxY = (height - y) / zoom;

    const nodeWidth = 50;
    const nodeHeight = 50;
    const newNodes = Array.from({ length: n }, (_, i) => {
      const randomX = minX + Math.random() * (maxX - minX - nodeWidth);
      const randomY = minY + Math.random() * (maxY - minY - nodeHeight);
      return {
        id: i.toString(),
        type: 'custom',
        position: { x: randomX, y: randomY },
      };
    });
    setNodes(newNodes);

    const newEdges = edges.map(([source, target], index) => {
      const edgeId = `edge-${index}`;
      return {
        id: edgeId,
        source: source.toString(),
        target: target.toString(),
        type: 'floating',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' },
        data: { weight: 0 },
      };
    });
    setEdges(newEdges);

    setIsGraphModalOpen(false);
  }, [setNodes, setEdges, getViewport]);

  useEffect(() => {
    if (isPaused || logSteps.length === 0) return;

    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        executeStep(currentStep);
        setCurrentStep(currentStep + 1);
      } else {
        setIsPaused(true);
      }
    }, 1000 / animationSpeed);

    return () => clearInterval(interval);
  }, [currentStep, logSteps, isPaused, animationSpeed, executeStep]);

  return (
    <AppContext.Provider
      value={{
        isWeighted,
        nodeStates,
        edgeStates,
        logMessages,
        setNodeState: setNodeStates,
        setEdgeState: setEdgeStates,
        addLogMessage: setLogMessages,
        clearLog: () => setLogMessages([]),
      }}
    >
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Menu
          onCreateModeChange={handleCreateModeChange}
          onDeleteModeChange={handleDeleteModeChange}
          onClearAll={onClearAll}
          onDirectedChange={handleDirectedChange}
          onWeightedChange={handleWeightedChange}
          onLogModalOpen={handleLogModalOpen}
          onGraphModalOpen={handleGraphModalOpen}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineComponent={CustomConnectionLine}
          connectionLineStyle={connectionLineStyle}
          connectOnClick={false}
        >
          <Background />
          <Controls position="bottom-right" />
        </ReactFlow>
        {isLogModalOpen && (
          <LogInputModal
            onClose={handleLogModalClose}
            onSubmit={handleLogSubmit}
            initialLog={logSteps.map((step) => step.raw).join('\n')}
          />
        )}
        {isGraphModalOpen && (
          <GraphInputModal
            onClose={handleGraphModalClose}
            onSubmit={handleGraphSubmit}
            initialGraph={graphInput}
          />
        )}
        {logSteps.length > 0 && (
          <PlaybackControls
            isPaused={isPaused}
            onPause={handlePause}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}
        <LogPanel />
      </div>
    </AppContext.Provider>
  );
};

const AppWithProvider = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default AppWithProvider;