'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  month: string;
  revenue: number;
  leads: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl animate-pulse">
        <span className="text-xs text-slate-400">Loading analytic charts...</span>
      </div>
    );
  }

  // Fallback data if none is generated
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 1000, leads: 5 },
    { month: 'Feb', revenue: 1800, leads: 8 },
    { month: 'Mar', revenue: 2200, leads: 12 },
    { month: 'Apr', revenue: 2900, leads: 15 },
    { month: 'May', revenue: 4200, leads: 19 },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-slate-100 dark:stroke-slate-800/80"
            vertical={false}
          />
          
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
              backdropFilter: 'blur(4px)',
            }}
            formatter={(value: any, name: any) => [
              name === 'revenue' ? `$${value}` : `${value} Inbound`,
              name === 'revenue' ? 'Revenue' : 'Leads Raised',
            ]}
          />
          
          {/* Revenue Area */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="revenue"
          />
          
          {/* Leads Area */}
          <Area
            type="monotone"
            dataKey="leads"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorLeads)"
            name="leads"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
