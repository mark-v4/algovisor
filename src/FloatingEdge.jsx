import { BaseEdge, EdgeLabelRenderer, getStraightPath, useInternalNode, useReactFlow } from '@xyflow/react';
import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import { getEdgeParams } from './utils.js';

function FloatingEdge({ id, source, target, markerEnd, style, data }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const { isWeighted, edgeStates } = useContext(AppContext);
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.weight.toString());

  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);
  const [path, labelX, labelY] = getStraightPath({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty });

  const edgeState = edgeStates[id] || {};

  const getEdgeStyle = () => {
    let edgeStyle = { ...style };
    if (edgeState.color) {
      edgeStyle.stroke = edgeState.color;
    }
    if (edgeState.highlight) {
      edgeStyle.strokeWidth = 1.5;
    } else {
      edgeStyle.strokeWidth = 1;
    }
    return edgeStyle;
  };

  const markerId = `${id}-arrow`;
  const markerColor = edgeState.markerEnd?.color || markerEnd?.color || '#b1b1b7';

  const saveWeight = () => {
    const parsedWeight = parseFloat(editValue);
    const newWeight = isNaN(parsedWeight) ? 0 : parsedWeight;
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === id || (edge.data?.undirectedPairId && edge.data.undirectedPairId === data.undirectedPairId)
          ? { ...edge, data: { ...edge.data, weight: newWeight } }
          : edge
      )
    );
    setIsEditing(false);
  };

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          viewBox="0 0 8 8"
          orient="auto"
          refX="6.5"
          refY="4"
        >
          <path
            d="M1,1 L6.5,4 L1,7"
            fill={markerColor}
            stroke={markerColor}
          />
        </marker>
      </defs>
      <BaseEdge id={id} path={path} markerEnd={`url(#${markerId})`} style={getEdgeStyle()} />
      {isWeighted && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              background: '#fff',
              padding: '2px 5px',
              borderRadius: '3px',
              fontSize: '12px',
            }}
            className="nodrag nopan"
            translate="no"
          >
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveWeight}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveWeight();
                  }
                }}
                autoFocus
                style={{
                  width: '50px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  padding: '2px',
                  fontSize: '12px',
                }}
              />
            ) : (
              <div onClick={() => isWeighted && setIsEditing(true)} style={{ cursor: 'pointer' }} translate="no">
                {data.weight}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}

export default FloatingEdge;