import { Position, MarkerType } from '@xyflow/react';
 
// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
// function getNodeIntersection(intersectionNode, targetNode) {
//   // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
//   const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
//     intersectionNode.measured;
//   const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
//   const targetPosition = targetNode.internals.positionAbsolute;
 
//   const w = intersectionNodeWidth / 2;
//   const h = intersectionNodeHeight / 2;
 
//   const x2 = intersectionNodePosition.x + w;
//   const y2 = intersectionNodePosition.y + h;
//   const x1 = targetPosition.x + targetNode.measured.width / 2;
//   const y1 = targetPosition.y + targetNode.measured.height / 2;
 
//   const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
//   const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
//   const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
//   const xx3 = a * xx1;
//   const yy3 = a * yy1;
//   const x = w * (xx3 + yy3) + x2;
//   const y = h * (-xx3 + yy3) + y2;
 
//   return { x, y };
// }
 
// // returns the position (top,right,bottom or right) passed node compared to the intersection point
// function getEdgePosition(node, intersectionPoint) {
//   const n = { ...node.internals.positionAbsolute, ...node };
//   const nx = Math.round(n.x);
//   const ny = Math.round(n.y);
//   const px = Math.round(intersectionPoint.x);
//   const py = Math.round(intersectionPoint.y);
 
//   if (px <= nx + 1) {
//     return Position.Left;
//   }
//   if (px >= nx + n.measured.width - 1) {
//     return Position.Right;
//   }
//   if (py <= ny + 1) {
//     return Position.Top;
//   }
//   if (py >= n.y + n.measured.height - 1) {
//     return Position.Bottom;
//   }
 
//   return Position.Top;
// }
 
// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
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