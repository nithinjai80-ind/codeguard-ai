import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { Cluster } from '../api/types';
import { ClusterNetwork } from '../components/charts/ClusterNetwork';
import { Badge } from '../components/common/Badge';
import {
  Network,
  Users,
  Filter,
  Layers,
  ChevronRight,
  GitCompare,
  SlidersHorizontal,
  Sparkles,
  Info
} from 'lucide-react';

export const ClustersPage: React.FC = () => {
  const { selectedClusterId, setSelectedClusterId, navigateToSimilarity } = useApp();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(80);
  const [selectedAssignment, setSelectedAssignment] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await CodeGuardApiService.getClusters();
        setClusters(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCluster =
    clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const filteredClusters = clusters.filter((c) => {
    if (selectedAssignment !== 'ALL' && !c.assignmentTitle.includes(selectedAssignment)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Submission Clusters
            </h1>
            <Badge variant="primary" size="md">
              23 Total Clusters
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Groups of submissions with significant similarity across student cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Surfaces multi-student sharing rings and hub nodes</span>
        </div>
      </div>

      {/* Cluster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map((cluster) => {
          const isSelected = cluster.id === (activeCluster?.id || '');

          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {cluster.name}
                </span>
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  {cluster.averageSimilarity}% Avg
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                {cluster.assignmentTitle}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Users className="w-3 h-3 text-indigo-500" />
                  {cluster.submissionCount} submissions
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {isSelected ? 'Viewing' : 'Inspect'} →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar for Network */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Similarity Threshold Slider */}
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Min Similarity:
            </span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
              className="w-28 accent-indigo-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 w-8">
              {similarityThreshold}%
            </span>
          </div>

          {/* Assignment dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Assignment:</span>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">All Assignments</option>
              <option value="Binary Search">Binary Search</option>
              <option value="Array Rotation">Array Rotation</option>
              <option value="Sorting">Sorting Algorithms</option>
            </select>
          </div>

          {/* Language dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">All Languages</option>
              <option value="Java">Java (JDK 21)</option>
              <option value="Python">Python</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Focus: <strong className="text-slate-700 dark:text-slate-200">{activeCluster?.name}</strong>
        </div>
      </div>

      {/* Cluster Detail Section with Similarity Network Graph */}
      {activeCluster && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-500" />
                  {activeCluster.name} — Similarity Network Graph
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Primary algorithmic topology: <em>"{activeCluster.primaryPattern}"</em>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="danger" size="sm" dot>
                  Strong Hub Correlation
                </Badge>
              </div>
            </div>

            {/* Interactive SVG Network Graph Component */}
            <ClusterNetwork
              cluster={activeCluster}
              minSimilarityFilter={similarityThreshold}
            />
          </div>

          {/* Cluster Member List Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Cluster Members & Hub Scores
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {activeCluster.students.length} Total Nodes
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Roll Number</th>
                  <th className="px-5 py-3">Submission ID</th>
                  <th className="px-4 py-3 text-center">Avg Similarity</th>
                  <th className="px-4 py-3 text-center">Eigenvector Centrality</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeCluster.students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500">{student.studentId}</td>
                    <td className="px-5 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                      {student.submissionId}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                      {student.similarityScore}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-300">
                      {(student.centrality * 100).toFixed(0)}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          navigateToSimilarity(
                            student.submissionId,
                            activeCluster.students[0].submissionId === student.submissionId
                              ? activeCluster.students[1].submissionId
                              : activeCluster.students[0].submissionId
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Compare with Hub
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
