// Pure layout computation for the requirements network map. Kept separate
// from the react-flow rendering component so the clustering logic can be
// unit-reasoned about (or swapped for a real force-directed layout from a
// backend) without touching any rendering code.

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 66;

// Hand-placed anchor points, arranged to loosely mirror a real system
// architecture map (auth/checkout/payments/fraud near each other on one
// side, catalog/loyalty/fulfillment/reporting grouped on the other).
const CLUSTER_ANCHORS = {
  auth: { x: 160, y: 140 },
  checkout: { x: 540, y: 100 },
  payments: { x: 920, y: 150 },
  fraud: { x: 1280, y: 90 },
  compliance: { x: 1020, y: 430 },
  catalog: { x: 200, y: 480 },
  loyalty: { x: 560, y: 560 },
  fulfillment: { x: 940, y: 700 },
  notifications: { x: 1300, y: 460 },
  reporting: { x: 560, y: 800 },
};

function clusterRadius(count) {
  if (count <= 1) return 0;
  if (count === 2) return 130;
  return 100 + count * 18;
}

export function buildNetworkLayout(requirements, clusters) {
  const byCluster = new Map();
  requirements.forEach((req) => {
    if (!byCluster.has(req.cluster)) byCluster.set(req.cluster, []);
    byCluster.get(req.cluster).push(req);
  });

  const positions = new Map();
  const clusterBoxes = [];

  byCluster.forEach((members, clusterId) => {
    const anchor = CLUSTER_ANCHORS[clusterId] ?? { x: 700, y: 450 };
    const radius = clusterRadius(members.length);

    members.forEach((req, i) => {
      let x, y;
      if (members.length === 1) {
        x = anchor.x;
        y = anchor.y;
      } else {
        const angle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
        x = anchor.x + radius * Math.cos(angle);
        y = anchor.y + radius * Math.sin(angle) * 0.78; // flatten slightly for a wider ellipse
      }
      positions.set(req.id, { x, y });
    });

    const xs = members.map((m) => positions.get(m.id).x);
    const ys = members.map((m) => positions.get(m.id).y);
    const pad = 70;
    const minX = Math.min(...xs) - NODE_WIDTH / 2 - pad;
    const maxX = Math.max(...xs) + NODE_WIDTH / 2 + pad;
    const minY = Math.min(...ys) - NODE_HEIGHT / 2 - pad - 18; // extra top room for the label
    const maxY = Math.max(...ys) + NODE_HEIGHT / 2 + pad;

    const meta = clusters.find((c) => c.id === clusterId);
    clusterBoxes.push({
      id: clusterId,
      label: meta?.label ?? clusterId,
      color: meta?.color ?? "#94a3b8",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      memberCount: members.length,
    });
  });

  // Cluster backgrounds are draggable as a group: each requirement node
  // below declares the matching `bg-${clusterId}` node as its parentNode,
  // so react-flow moves every member along with its cluster automatically
  // while still allowing each member to be dragged individually within it
  // (constrained to the cluster's box via `extent: "parent"`).
  const clusterBgNodes = clusterBoxes.map((box) => ({
    id: `bg-${box.id}`,
    type: "clusterBackground",
    position: { x: box.x, y: box.y },
    data: { label: box.label, color: box.color, width: box.width, height: box.height, count: box.memberCount },
    style: { width: box.width, height: box.height },
    draggable: true,
    selectable: false,
    zIndex: 0,
  }));

  const clusterBoxById = new Map(clusterBoxes.map((box) => [box.id, box]));

  const requirementNodes = requirements.map((req) => {
    const pos = positions.get(req.id) ?? { x: 0, y: 0 };
    const absoluteX = pos.x - NODE_WIDTH / 2;
    const absoluteY = pos.y - NODE_HEIGHT / 2;
    const box = clusterBoxById.get(req.cluster);

    return {
      id: req.id,
      type: "requirementNode",
      // Relative to the parent cluster box's top-left corner once a parent
      // is set; react-flow resolves the absolute render position itself.
      position: box ? { x: absoluteX - box.x, y: absoluteY - box.y } : { x: absoluteX, y: absoluteY },
      parentNode: box ? `bg-${req.cluster}` : undefined,
      extent: box ? "parent" : undefined,
      data: { requirement: req },
      draggable: true,
      zIndex: 10,
    };
  });

  // Build undirected, deduplicated edges from relatedIds.
  const seenPairs = new Set();
  const edges = [];
  requirements.forEach((req) => {
    (req.relatedIds || []).forEach((relId) => {
      if (!requirements.some((r) => r.id === relId)) return;
      const key = [req.id, relId].sort().join("__");
      if (seenPairs.has(key)) return;
      seenPairs.add(key);

      const related = requirements.find((r) => r.id === relId);
      const sameCluster = related.cluster === req.cluster;

      edges.push({
        id: `e-${key}`,
        source: req.id,
        target: relId,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: sameCluster ? "#94a3b8" : "#c7cdd6",
          strokeWidth: sameCluster ? 1.6 : 1.2,
          strokeDasharray: sameCluster ? undefined : "4 4",
        },
      });
    });
  });

  // Manual links (from mockManualLinks.js) are intentionally not built
  // here. NetworkMap.jsx merges them into the edge list on its own, kept
  // out of this function entirely so the Pathfinder-style automatic
  // clustering/linking logic above stays byte-for-byte what it was before
  // manual linking existed, unaffected by manual links being added or
  // removed.
  return { nodes: [...clusterBgNodes, ...requirementNodes], edges, clusterBoxes };
}
