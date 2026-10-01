import React, { useState } from 'react';
import { Cluster } from '../../api/types';
import { ExternalLink, Users, AlertCircle, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ClusterNetworkProps {
  cluster: Cluster;
  minSimilarityFilter?: number;
}

export const ClusterNetwork: React.FC<ClusterNetworkProps> = ({
  cluster,
  minSimilarityFilter = 75
}) => {
  const { navigateToSimilarity } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    cluster.students[0]?.studentId || null
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const width = 640;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;

  // Filter connections by threshold
  const activeConnections = cluster.connections.filter(
    (c) => c.similarity >= minSimilarityFilter
  );

  // Position nodes in a clean radial distribution
  const nodeCount = cluster.students.length;
  const nodePositions = cluster.students.map((student, i) => {
    // If hub/central node, put near center
    if (student.centrality >= 0.9 && i === 0) {
      return { ...student, x: centerX - 30, y: centerY - 20 };
    }
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const radius = 140 + (i % 2 === 0 ? 30 : -20);
    return {
      ...student,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });

  const getPosition = (id: string) => {
    return nodePositions.find((n) => n.studentId === id) || { x: centerX, y: centerY };
  };

  const selectedNode = cluster.students.find((s) => s.studentId === selectedStudentId);

  // Find peers connected to selected node
  const connectedPeerIds = new Set(
    activeConnections
      .filter((c) => c.source === selectedStudentId || c.target === selectedStudentId)
      .map((c) => (c.source === selectedStudentId ? c.target : c.source))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Network Canvas */}
      <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
        {/* Canvas Header / Legend */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {cluster.name}: {nodePositions.length} Students
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {activeConnections.length} Active Ties
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Thick Line = High Similarity</span>
        </div>

        {/* SVG Graph */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-[440px] select-none"
        >
          {/* Background subtle radial grid circles */}
          <circle cx={centerX} cy={centerY} r={80} fill="none" stroke="#1e293b" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r={160} fill="none" stroke="#1e293b" strokeDasharray="3 3" />

          {/* Connection Lines (Edges) */}
          {activeConnections.map((conn, idx) => {
            const posA = getPosition(conn.source);
            const posB = getPosition(conn.target);
            const isRelevant =
              hoveredNodeId === conn.source ||
              hoveredNodeId === conn.target ||
              selectedStudentId === conn.source ||
              selectedStudentId === conn.target;

            // Stroke thickness based on similarity
            const strokeWidth = conn.similarity >= 90 ? 4 : conn.similarity >= 85 ? 2.8 : 1.6;
            const strokeColor = conn.similarity >= 90 ? '#f43f5e' : conn.similarity >= 85 ? '#f59e0b' : '#6366f1';

            return (
              <g key={idx}>
                <line
                  x1={posA.x}
                  y1={posA.y}
                  x2={posB.x}
                  y2={posB.y}
                  stroke={isRelevant ? strokeColor : '#334155'}
                  strokeWidth={isRelevant ? strokeWidth + 1 : strokeWidth}
                  strokeOpacity={isRelevant ? 1 : 0.45}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                {/* Edge similarity label if selected */}
                {isRelevant && (
                  <text
                    x={(posA.x + posB.x) / 2}
                    y={(posA.y + posB.y) / 2 - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-300 font-mono font-bold bg-slate-900"
                  >
                    {conn.similarity}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Node Circles */}
          {nodePositions.map((node) => {
            const isSelected = selectedStudentId === node.studentId;
            const isHovered = hoveredNodeId === node.studentId;
            const isConnected = connectedPeerIds.has(node.studentId);

            return (
              <g
                key={node.studentId}
                onClick={() => setSelectedStudentId(node.studentId)}
                onMouseEnter={() => setHoveredNodeId(node.studentId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer"
              >
                {/* Halo for selected node */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                )}

                {/* Main Node body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={
                    isSelected
                      ? '#6366f1'
                      : isConnected
                      ? '#f43f5e'
                      : '#1e293b'
                  }
                  stroke={
                    node.similarityScore >= 90
                      ? '#f43f5e'
                      : '#475569'
                  }
                  strokeWidth={2.5}
                  className="transition-transform duration-150 hover:scale-110"
                />

                {/* Node initials */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-white select-none pointer-events-none"
                >
                  {node.name.split(' ').map((n) => n[0]).join('')}
                </text>

                {/* Node Student Label */}
                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  className={`text-[11px] font-medium pointer-events-none select-none ${
                    isSelected ? 'fill-indigo-300 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Inspector Panel */}
      <div className="w-full lg:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Node Inspector
            </span>
            {selectedNode && (
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                Avg: {selectedNode.similarityScore}%
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedNode.name}
                </h4>
                <p className="text-xs font-mono text-slate-500">{selectedNode.studentId}</p>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Submission: {selectedNode.submissionId}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                  Cluster Centrality Index:
                </span>
                <div className="flex items-center justify-between font-mono font-semibold text-slate-800 dark:text-slate-200">
                  <span>{(selectedNode.centrality * 100).toFixed(0)}% Eigenvector Hub</span>
                  <span className="text-indigo-500">Strong Core</span>
                </div>
              </div>

              {/* Connected peer ties */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Tied Submissions in Cluster:
                </span>
                <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {activeConnections
                    .filter((c) => c.source === selectedNode.studentId || c.target === selectedNode.studentId)
                    .map((c, i) => {
                      const peerId = c.source === selectedNode.studentId ? c.target : c.source;
                      const peer = cluster.students.find((s) => s.studentId === peerId);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {peer?.name || peerId}
                          </span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {c.similarity}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Click any node in the network to inspect its connections.
            </div>
          )}
        </div>

        {/* Action Button */}
        {selectedNode && (
          <button
            onClick={() => {
              // Open similarity analysis with top peer
              const topTie = activeConnections.find(
                (c) => c.source === selectedNode.studentId || c.target === selectedNode.studentId
              );
              const peerId = topTie
                ? topTie.source === selectedNode.studentId
                  ? topTie.target
                  : topTie.source
                : cluster.students[1]?.studentId;
              const peer = cluster.students.find((s) => s.studentId === peerId);

              navigateToSimilarity(
                selectedNode.submissionId,
                peer ? peer.submissionId : 'SUB-1049'
              );
            }}
            className="w-full mt-4 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Analyze in Side-by-Side Diff
          </button>
        )}
      </div>
    </div>
  );
};
