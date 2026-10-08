import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CodeGuardApiService } from '../api/apiService';
import { SystemSettings } from '../api/types';
import { Badge } from '../components/common/Badge';
import {
  Settings,
  Sliders,
  Code2,
  CheckSquare,
  Save,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await CodeGuardApiService.getSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!settings) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await CodeGuardApiService.updateSettings(settings);
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Detection thresholds and active pipeline rules successfully updated.'
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Unable to write settings configuration.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      structuralThreshold: 80,
      semanticThreshold: 85,
      behavioralThreshold: 80,
      timelineWindowMinutes: 10,
      minEvidenceRegions: 3,
      activeRules: {
        structural: true,
        semantic: true,
        behavioral: true,
        timeline: true
      },
      supportedLanguages: [
        { name: 'Java', status: 'Fully Supported', version: 'JDK 21 / OpenJDK' },
        { name: 'Python', status: 'Planned', version: '3.11+' },
        { name: 'C++', status: 'Planned', version: 'GCC / Clang 17' },
        { name: 'JavaScript', status: 'Planned', version: 'Node.js 20+' }
      ],
      normalization: {
        stripComments: true,
        normalizeVariableNames: true,
        ignoreFormatting: true,
        astFlattening: true
      }
    });

    addToast({
      type: 'info',
      title: 'Defaults Restored',
      message: 'Reset configuration values to institutional baseline.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fine-tune multi-vector sensitivity thresholds, language support, and review triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Detection Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Detection Settings & Thresholds
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set sensitivity thresholds for each orthogonal signal layer
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Institutional Bounds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Structural Threshold */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-structural-threshold">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Structural Similarity Threshold
                  </span>
                  <span className="text-[11px] text-slate-400">
                    AST node sequences and CFG branch matches
                  </span>
                </label>
                <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {settings.structuralThreshold}%
                </span>
              </div>
              <input
                id="settings-structural-threshold"
                name="structuralThreshold"
                aria-label="Structural Similarity Threshold"
                type="range"
                min="50"
                max="98"
                value={settings.structuralThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, structuralThreshold: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Semantic Threshold */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-semantic-threshold">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Semantic Similarity Threshold
                  </span>
                  <span className="text-[11px] text-slate-400">
                    CodeBERT dense vector cosine similarity
                  </span>
                </label>
                <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {settings.semanticThreshold}%
                </span>
              </div>
              <input
                id="settings-semantic-threshold"
                name="semanticThreshold"
                aria-label="Semantic Similarity Threshold"
                type="range"
                min="50"
                max="98"
                value={settings.semanticThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, semanticThreshold: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Behavioral Threshold */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-behavioral-threshold">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Behavioral Similarity Threshold
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Test harness input/output execution equivalence
                  </span>
                </label>
                <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {settings.behavioralThreshold}%
                </span>
              </div>
              <input
                id="settings-behavioral-threshold"
                name="behavioralThreshold"
                aria-label="Behavioral Similarity Threshold"
                type="range"
                min="50"
                max="98"
                value={settings.behavioralThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, behavioralThreshold: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Timeline Window */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-timeline-window">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Timeline Correlation Window
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Max minutes between submissions triggering correlation
                  </span>
                </label>
                <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {settings.timelineWindowMinutes} min
                </span>
              </div>
              <input
                id="settings-timeline-window"
                name="timelineWindowMinutes"
                aria-label="Timeline Correlation Window"
                type="range"
                min="2"
                max="60"
                step="2"
                value={settings.timelineWindowMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, timelineWindowMinutes: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Minimum Evidence Regions Input */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <label htmlFor="settings-min-evidence">
              <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                Minimum Matching Evidence Regions
              </span>
              <span className="text-[11px] text-slate-500">
                Number of distinct code blocks required before placing submission into Review Queue
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="settings-min-evidence"
                name="minEvidenceRegions"
                aria-label="Minimum Matching Evidence Regions"
                type="number"
                min="1"
                max="10"
                value={settings.minEvidenceRegions}
                onChange={(e) =>
                  setSettings({ ...settings, minEvidenceRegions: Number(e.target.value) })
                }
                className="w-16 px-2.5 py-1.5 text-xs text-center font-mono font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500 font-medium">blocks</span>
            </div>
          </div>
        </div>

        {/* Section 2: Language Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              Language Compilers & Analysis Support
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Available AST parsers, bytecode analyzers, and token normalizers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {settings.supportedLanguages.map((lang, idx) => {
              const isSupported = lang.status === 'Fully Supported';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isSupported
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500/40 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang.name}
                    </span>
                    <Badge variant={isSupported ? 'success' : 'neutral'} size="sm">
                      {lang.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {lang.version}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Review Rules (Checkboxes) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              Active Review Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select which signals participate in generating automated "Review Required" queue alerts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Rule 1 */}
            <label htmlFor="rule-structural" className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300">
              <input
                id="rule-structural"
                name="rule-structural"
                type="checkbox"
                checked={settings.activeRules.structural}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    activeRules: { ...settings.activeRules, structural: e.target.checked }
                  })
                }
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Structural Similarity (AST / CFG)
                </span>
                <span className="text-[11px] text-slate-500">
                  Parse grammar tokens and identify normalized syntactic structures.
                </span>
              </div>
            </label>

            {/* Rule 2 */}
            <label htmlFor="rule-semantic" className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300">
              <input
                id="rule-semantic"
                name="rule-semantic"
                type="checkbox"
                checked={settings.activeRules.semantic}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    activeRules: { ...settings.activeRules, semantic: e.target.checked }
                  })
                }
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Semantic Similarity (CodeBERT)
                </span>
                <span className="text-[11px] text-slate-500">
                  Generate transformer embeddings to detect semantic intent equivalence.
                </span>
              </div>
            </label>

            {/* Rule 3 */}
            <label htmlFor="rule-behavioral" className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300">
              <input
                id="rule-behavioral"
                name="rule-behavioral"
                type="checkbox"
                checked={settings.activeRules.behavioral}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    activeRules: { ...settings.activeRules, behavioral: e.target.checked }
                  })
                }
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Behavioral Similarity (Test Traces)
                </span>
                <span className="text-[11px] text-slate-500">
                  Compare execution branch vectors and runtime input-output pairings.
                </span>
              </div>
            </label>

            {/* Rule 4 */}
            <label htmlFor="rule-timeline" className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300">
              <input
                id="rule-timeline"
                name="rule-timeline"
                type="checkbox"
                checked={settings.activeRules.timeline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    activeRules: { ...settings.activeRules, timeline: e.target.checked }
                  })
                }
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Timeline Correlation (<span className="font-mono">{settings.timelineWindowMinutes}m</span>)
                </span>
                <span className="text-[11px] text-slate-500">
                  Flag tight temporal submission intervals between similar submissions.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar at bottom */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Configurations are applied in real time across active assignment evaluations.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configuration...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
