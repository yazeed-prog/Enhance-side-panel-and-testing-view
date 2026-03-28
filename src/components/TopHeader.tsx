import { ChevronDown, Play, Clock, MoreHorizontal } from 'lucide-react';

interface TopHeaderProps {
  canvasPan?: { x: number; y: number };
}

export function TopHeader({ canvasPan = { x: 0, y: 0 } }: TopHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button 
            className="flex items-center gap-1 transition-colors text-gray-600 hover:text-gray-900"
          >
            Uncategorized
            <ChevronDown size={16} />
          </button>
          <span className="text-gray-400">/</span>
          <button 
            className="flex items-center gap-1 transition-colors text-gray-900"
          >
            Untitled
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
        >
          <Play size={16} />
          Runs
        </button>
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
        >
          <Clock size={16} />
          Versions
        </button>
        <button 
          className="p-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </header>
  );
}
