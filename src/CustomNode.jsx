import { Handle, Position, useConnection } from '@xyflow/react';
import { useContext } from 'react';
import { AppContext } from './AppContext';

export default function CustomNode({ id, data }) {
  const connection = useConnection();
  const { nodeStates } = useContext(AppContext);
  const nodeState = nodeStates[id] || {};

  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const getClassName = () => {
    let className = 'react-flow__node-custom';
    if (nodeState.visit) className += ' visit';
    if (nodeState.highlight) className += ' highlight';
    if (nodeState.visited) className += ' visited';
    if (nodeState.inQueue) className += ' inQueue';
    return className;
  };

  const getStyle = () => {
    const style = {};
    if (nodeState.color) {
      style.backgroundColor = nodeState.color;
    }
    if (nodeState.borderColor) {
      style.borderColor = nodeState.borderColor;
    }
    if (nodeState.textColor) {
      style.color = nodeState.textColor;
    }
    return style;
  };

  return (
    <div className={getClassName()} style={getStyle()}>
      <div className="customNodeBody">
        {!connection.inProgress && (
          <Handle className="customHandle" position={Position.Right} type="source" />
        )}
        {(!connection.inProgress || isTarget) && (
          <Handle className="customHandle" position={Position.Left} type="target" isConnectableStart={false} />
        )}
        {nodeState.text || id}
      </div>
    </div>
  );
}