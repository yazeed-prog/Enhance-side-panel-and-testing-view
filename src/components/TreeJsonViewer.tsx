import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TreeJsonViewerProps {
  data: any;
}

function getItemCount(value: any): string {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length !== 1 ? 's' : ''}`;
  }
  if (value && typeof value === 'object') {
    const count = Object.keys(value).length;
    return `${count} item${count !== 1 ? 's' : ''}`;
  }
  return '';
}

function getBrackets(value: any): [string, string] {
  if (Array.isArray(value)) return ['[', ']'];
  return ['{', '}'];
}

function TreeNode({ label, value, depth = 0, isArrayIndex = false }: {
  label?: string;
  value: any;
  depth?: number;
  isArrayIndex?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const isExpandable = value !== null && typeof value === 'object';
  const indent = depth * 24;

  if (!isExpandable) {
    // Leaf node
    return (
      <div className="flex" style={{ paddingLeft: indent }}>
        <div className="flex items-baseline gap-0 py-[1px] min-w-0 flex-wrap" style={{ paddingLeft: 20 }}>
          {label !== undefined && (
            <>
              <span className={`${isArrayIndex ? 'text-purple-600' : 'text-gray-600'} whitespace-nowrap`}>
                {label}
              </span>
              <span className="text-gray-400 mx-1">:</span>
            </>
          )}
          {renderValue(value)}
        </div>
      </div>
    );
  }

  const [open, close] = getBrackets(value);
  const count = getItemCount(value);
  const entries = Array.isArray(value)
    ? value.map((v, i) => ({ key: String(i), value: v, isIndex: true }))
    : Object.entries(value).map(([k, v]) => ({ key: k, value: v, isIndex: false }));

  return (
    <div>
      <div
        className="flex items-baseline cursor-pointer hover:bg-gray-100 rounded-sm transition-colors"
        style={{ paddingLeft: indent }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex-shrink-0 w-5 flex items-center justify-center text-gray-400">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <div className="flex items-baseline gap-0 py-[1px] flex-wrap">
          {label !== undefined && (
            <>
              <span className={`${isArrayIndex ? 'text-purple-600' : 'text-gray-600'}`}>
                {label}
              </span>
              <span className="text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600">{open}</span>
          <span className="text-gray-400 ml-2 text-[12px] italic">{count}</span>
        </div>
      </div>
      {expanded && (
        <div>
          {entries.map(({ key, value: v, isIndex }) => (
            <TreeNode
              key={key}
              label={key}
              value={v}
              depth={depth + 1}
              isArrayIndex={isIndex}
            />
          ))}
          <div style={{ paddingLeft: indent }}>
            <span className="text-gray-600 pl-5">{close}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function renderValue(value: any) {
  if (value === null) {
    return <span className="text-gray-400 italic">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-600">{String(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-blue-600">{value}</span>;
  }
  if (typeof value === 'string') {
    return (
      <span className="text-red-600 break-all">
        "{value}"
      </span>
    );
  }
  return <span className="text-gray-600">{String(value)}</span>;
}

export function TreeJsonViewer({ data }: TreeJsonViewerProps) {
  return (
    <div className="font-mono text-[13px] leading-[22px] select-text">
      <TreeNode value={data} />
    </div>
  );
}