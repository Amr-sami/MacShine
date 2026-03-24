"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const MOCK_FREQUENCY_DATA = [
  { month: "Jan", sessions: 4 },
  { month: "Feb", sessions: 7 },
  { month: "Mar", sessions: 5 },
  { month: "Apr", sessions: 12 },
  { month: "May", sessions: 8 },
  { month: "Jun", sessions: 20 },
  { month: "Jul", sessions: 15 },
  { month: "Aug", sessions: 9 },
  { month: "Sep", sessions: 11 },
  { month: "Oct", sessions: 18 },
  { month: "Nov", sessions: 14 },
  { month: "Dec", sessions: 22 },
];

export default function DashboardOverview() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Cloud Dashboard</h1>
      <p className="text-mc-muted mb-8">Aggregated telemetry from all your synced macs.</p>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-mc-surface border border-mc-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mc-accent/5 blur-[40px] rounded-full group-hover:bg-mc-accent/10 transition-colors" />
          <h3 className="text-mc-muted text-sm font-medium mb-1">Total Lifetime Freed</h3>
          <p className="text-3xl font-bold text-mc-accent text-transparent bg-clip-text bg-gradient-to-br from-mc-accent to-white">
            142.5 GB
          </p>
          <div className="mt-4 text-xs font-mono text-mc-muted">Across 34 sessions</div>
        </div>

        <div className="bg-mc-surface border border-mc-border p-6 rounded-2xl">
          <h3 className="text-mc-muted text-sm font-medium mb-1">Active Synced Devices</h3>
          <p className="text-3xl font-bold text-mc-text">3 <span className="text-lg text-mc-muted">/ 5</span></p>
          <div className="mt-4 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-mc-text flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-mc-accent"></span>Amr's MacBook Pro</span>
              <span className="text-mc-muted">Today</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-mc-text flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-mc-accent"></span>Studio Mac</span>
              <span className="text-mc-muted">2d ago</span>
            </div>
          </div>
        </div>

        <div className="bg-mc-surface border border-mc-border p-6 rounded-2xl">
          <h3 className="text-mc-muted text-sm font-medium mb-1">Top Module</h3>
          <p className="text-2xl font-bold text-mc-text">System Caches</p>
          <div className="mt-4 text-xs text-mc-muted">
            <div className="flex justify-between mb-1">
              <span>Caches</span>
              <span className="text-mc-text">54.2 GB</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Large Files</span>
              <span className="text-mc-text">41.0 GB</span>
            </div>
            <div className="flex justify-between">
              <span>Trash</span>
              <span className="text-mc-text">12.5 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-mc-surface border border-mc-border p-6 rounded-2xl mb-8">
        <h3 className="text-lg font-bold mb-6">Cleaning Frequency</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_FREQUENCY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2F2C" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#808A85', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#808A85', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#1E2420' }}
                contentStyle={{ backgroundColor: '#0d0f0e', borderColor: '#2A2F2C', borderRadius: '8px' }}
                itemStyle={{ color: '#4ade80' }}
              />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                {MOCK_FREQUENCY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.sessions > 15 ? '#4ade80' : '#2A2F2C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
