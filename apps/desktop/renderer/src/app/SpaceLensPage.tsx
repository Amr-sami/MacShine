import React, { useState, useEffect } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';

interface DirNode {
  name: string;
  sizeBytes: number;
  path: string;
  [key: string]: any; // To satisfy TreemapDataType index signature
}

export function SpaceLensPage() {
  const [currentPath, setCurrentPath] = useState('');
  const [nodes, setNodes] = useState<DirNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format bytes to human readable
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setCurrentPath(path);
    try {
      const results = await window.macclean.getDirectorySizes(path);
      // Recharts Treemap wants an array of objects
      setNodes(results);
    } catch (err) {
      console.error('Failed to load dir sizes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Determine user's home directory. Since we don't have a direct IPC for it, 
    // we can use a known path format or request it. The Python bridge could get it, 
    // but for now let's just use /Users/ as the root if we don't know the username.
    // Let's assume typical macOS setup for now.
    loadDirectory('/Users');
  }, []);

  const handleNodeClick = (data: any) => {
    if (data && data.path) {
      loadDirectory(data.path);
    }
  };

  const navigateUp = () => {
    if (currentPath === '/' || currentPath === '/Users') return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDirectory(parts.join('/') || '/');
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mc-text">Space Lens</h2>
          <p className="text-sm text-mc-muted mt-1">Visualize what's taking up your disk space.</p>
        </div>
      </div>

      <div className="bg-mc-surface border border-mc-border rounded-lg p-4 mb-4 flex items-center gap-4">
        <button
          onClick={navigateUp}
          disabled={currentPath === '/' || currentPath === '/Users'}
          className="px-3 py-1.5 bg-mc-bg border border-mc-border rounded text-sm text-mc-text hover:bg-mc-border transition-colors disabled:opacity-50"
        >
          &uarr; Up
        </button>
        <div className="flex-1 font-mono text-sm text-mc-accent truncate">
          {currentPath}
        </div>
      </div>

      <div className="flex-1 bg-mc-surface border border-mc-border rounded-xl p-4 min-h-[400px]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-mc-muted">
            <div className="w-8 h-8 rounded-full border-2 border-mc-accent border-t-transparent animate-spin mb-4" />
            <p>Scanning directory sizes via du...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-mc-muted">
            <p>Empty or inaccessible directory.</p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={nodes as any}
                dataKey="sizeBytes"
                nameKey="name"
                stroke="#0d0f0e"
                fill="#2A2F2C"
                onClick={handleNodeClick}
                content={<CustomTreemapContent colors={['#4ade80', '#2dd4bf', '#a78bfa', '#f472b6', '#fbbf24']} />}
              >
                <Tooltip content={<CustomTooltip formatBytes={formatBytes} />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Treemap Cell Content
const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : '#1E2420',
          stroke: '#0d0f0e',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
          cursor: 'pointer',
        }}
        className="hover:opacity-80 transition-opacity"
      />
      {width > 50 && height > 30 && (
        <text x={x + 4} y={y + 14} fill="#0d0f0e" fontSize={12} fillOpacity={0.9} fontWeight="bold" className="pointer-events-none truncate">
          {name}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload, formatBytes }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-mc-bg border border-mc-border p-3 rounded-lg shadow-xl pointer-events-none">
        <p className="font-bold text-mc-text mb-1">{data.name}</p>
        <p className="text-mc-accent font-mono text-sm">{formatBytes(data.sizeBytes)}</p>
        <p className="text-xs text-mc-muted truncate max-w-[300px] mt-1">{data.path}</p>
      </div>
    );
  }
  return null;
};
