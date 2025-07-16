import { Position, MarkerType } from '@xyflow/react';

export function getEdgeParams(source, target) {
  const sourceCenter = {
    x: source.internals.positionAbsolute.x + source.measured.width / 2,
    y: source.internals.positionAbsolute.y + source.measured.height / 2,
  };

  const targetCenter = {
    x: target.internals.positionAbsolute.x + target.measured.width / 2,
    y: target.internals.positionAbsolute.y + target.measured.height / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  const angle = Math.atan2(dy, dx);

  const sourceRadius = Math.min(source.measured.width, source.measured.height) / 2;
  const targetRadius = Math.min(target.measured.width, target.measured.height) / 2;

  const sx = sourceCenter.x + sourceRadius * Math.cos(angle);
  const sy = sourceCenter.y + sourceRadius * Math.sin(angle);
  const tx = targetCenter.x - targetRadius * Math.cos(angle);
  const ty = targetCenter.y - targetRadius * Math.sin(angle);

  return {
    sx,
    sy,
    tx,
    ty,
  };
}
 
export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
 
  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });
 
  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;
 
    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });
 
    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }
 
  return { nodes, edges };
}