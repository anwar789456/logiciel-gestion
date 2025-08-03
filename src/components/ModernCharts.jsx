import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { MoreHorizontal, TrendingUp, Download } from 'lucide-react';

// Couleurs modernes et professionnelles
const MODERN_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

// Composant de conteneur moderne pour les graphiques
const ModernChartContainer = ({ title, subtitle, children, actions = null, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Tooltip personnalisé moderne
const ModernTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 min-w-[200px]">
        <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('fr-FR') : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Pie Chart moderne
export const ModernPieChart = ({ data, title, subtitle, dataKey = 'value', nameKey = 'name' }) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
        className="drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const actions = (
    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
      <Download className="h-4 w-4" />
      Export
    </button>
  );

  return (
    <ModernChartContainer title={title} subtitle={subtitle} actions={actions}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey={dataKey}
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={MODERN_COLORS[index % MODERN_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ModernTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend personnalisée */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: MODERN_COLORS[index % MODERN_COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {entry[nameKey]}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry[dataKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ModernChartContainer>
  );
};

// Bar Chart moderne
export const ModernBarChart = ({ data, title, subtitle, xKey = 'name', yKey = 'value', color = '#6366F1' }) => {
  const actions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">+12%</span>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );

  return (
    <ModernChartContainer title={title} subtitle={subtitle} actions={actions}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
          <XAxis 
            dataKey={xKey} 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ModernTooltip />} />
          <Bar 
            dataKey={yKey} 
            fill={`url(#gradient-${color.replace('#', '')})`}
            radius={[8, 8, 0, 0]}
            stroke={color}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </ModernChartContainer>
  );
};

// Line Chart moderne
export const ModernLineChart = ({ data, title, subtitle, xKey = 'name', yKey = 'value', color = '#10B981' }) => {
  const actions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">+8.2%</span>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );

  return (
    <ModernChartContainer title={title} subtitle={subtitle} actions={actions}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`lineGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
          <XAxis 
            dataKey={xKey} 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ModernTooltip />} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="none"
            fill={`url(#lineGradient-${color.replace('#', '')})`}
          />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 5, stroke: '#fff' }}
            activeDot={{ r: 7, stroke: color, strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ModernChartContainer>
  );
};

// Multi-Bar Chart moderne
export const ModernMultiBarChart = ({ data, title, subtitle, bars = [] }) => {
  const actions = (
    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
      <Download className="h-4 w-4" />
      Export
    </button>
  );

  return (
    <ModernChartContainer title={title} subtitle={subtitle} actions={actions}>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ModernTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          {bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              fill={bar.color || MODERN_COLORS[index % MODERN_COLORS.length]} 
              name={bar.name}
              radius={[4, 4, 0, 0]}
              stroke={bar.color || MODERN_COLORS[index % MODERN_COLORS.length]}
              strokeWidth={1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ModernChartContainer>
  );
};
