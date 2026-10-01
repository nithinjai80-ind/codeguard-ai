import React, { useState } from 'react';
import { Copy, Check, FileCode, Maximize2, Minimize2 } from 'lucide-react';
import { CodeRegion } from '../../api/types';

interface MonacoCodeViewerProps {
  code: string;
  language?: string;
  fileName?: string;
  title?: string;
  highlightRegions?: CodeRegion[];
  activeRegionIndex?: number | null;
  onRegionClick?: (index: number) => void;
  maxHeight?: string;
  titleBadge?: React.ReactNode;
}

// Simple fast syntax token parser for Java/C/JS
function tokenizeLine(line: string) {
  // Check for full line comments
  if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
    return <span className="text-emerald-600 dark:text-emerald-400 italic">{line}</span>;
  }

  const keywords = new Set([
    'package', 'import', 'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
    'static', 'final', 'void', 'int', 'double', 'float', 'boolean', 'char', 'long', 'byte', 'short',
    'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this',
    'super', 'null', 'true', 'false', 'try', 'catch', 'finally', 'throw', 'throws'
  ]);

  // Regex tokens
  const regex = /(".*?"|'.*?'|\/\/.*$|\b(?:package|import|public|private|protected|class|interface|extends|implements|static|final|void|int|double|float|boolean|char|long|byte|short|return|if|else|for|while|do|switch|case|break|continue|new|this|super|null|true|false|try|catch|finally|throw|throws)\b|\b\d+\b|[a-zA-Z_$][a-zA-Z0-9_$]*|[+\-*/%=<>!&|^~]+|[(),;{}[\]])/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('"') || token.startsWith("'")) {
      parts.push(<span key={match.index} className="text-amber-600 dark:text-amber-300">{token}</span>);
    } else if (token.startsWith('//')) {
      parts.push(<span key={match.index} className="text-emerald-600 dark:text-emerald-400 italic">{token}</span>);
    } else if (keywords.has(token)) {
      parts.push(<span key={match.index} className="text-indigo-600 dark:text-indigo-400 font-semibold">{token}</span>);
    } else if (/^\d+$/.test(token)) {
      parts.push(<span key={match.index} className="text-cyan-600 dark:text-cyan-300">{token}</span>);
    } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(token)) {
      parts.push(<span key={match.index} className="text-sky-600 dark:text-sky-300 font-medium">{token}</span>);
    } else {
      parts.push(token);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

export const MonacoCodeViewer: React.FC<MonacoCodeViewerProps> = ({
  code,
  language = 'Java',
  fileName = 'Solution.java',
  highlightRegions = [],
  activeRegionIndex = null,
  onRegionClick,
  maxHeight = '520px',
  titleBadge
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRegionForLine = (lineNum: number) => {
    return highlightRegions.findIndex(
      (r) => lineNum >= r.startLine && lineNum <= r.endLine
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-md flex flex-col">
      {/* Editor Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-slate-300 font-medium">{fileName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {language}
          </span>
          {titleBadge}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-mono text-[11px] mr-2">
            {lines.length} lines
          </span>
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        className="overflow-auto font-mono text-[13px] leading-relaxed select-text"
        style={{ maxHeight: isExpanded ? '80vh' : maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const regionIdx = getRegionForLine(lineNum);
              const isFlagged = regionIdx !== -1;
              const isActive = activeRegionIndex !== null && activeRegionIndex === regionIdx;

              let lineBgClass = '';
              if (isActive) {
                lineBgClass = 'bg-indigo-950/60 border-l-2 border-indigo-400';
              } else if (isFlagged) {
                lineBgClass = 'bg-rose-950/30 border-l-2 border-rose-500/60';
              }

              return (
                <tr
                  key={lineNum}
                  onClick={() => isFlagged && onRegionClick && onRegionClick(regionIdx)}
                  className={`group transition-colors ${lineBgClass} ${isFlagged ? 'cursor-pointer hover:bg-rose-950/50' : 'hover:bg-slate-800/40'}`}
                >
                  {/* Line Number Gutter */}
                  <td className="w-12 text-right pr-4 pl-2 py-0.5 text-slate-600 select-none text-xs border-r border-slate-800/60 group-hover:text-slate-400">
                    {lineNum}
                  </td>
                  {/* Region Marker Indicator */}
                  <td className="w-2 px-1 text-[10px] select-none text-center">
                    {isFlagged && (
                      <span
                        title={highlightRegions[regionIdx]?.description}
                        className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : 'bg-rose-500'}`}
                      />
                    )}
                  </td>
                  {/* Code Line Content */}
                  <td className="pl-3 pr-4 py-0.5 whitespace-pre font-mono text-slate-200">
                    {tokenizeLine(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
