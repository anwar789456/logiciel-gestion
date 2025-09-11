import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ModernStatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend = null,
  loading = false,
  percentage = null,
  timeframe = null
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'text-white',
      accent: 'bg-blue-100 dark:bg-blue-900/30',
      accentText: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'text-white',
      accent: 'bg-green-100 dark:bg-green-900/30',
      accentText: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      icon: 'text-white',
      accent: 'bg-yellow-100 dark:bg-yellow-900/30',
      accentText: 'text-yellow-600 dark:text-yellow-400'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'text-white',
      accent: 'bg-red-100 dark:bg-red-900/30',
      accentText: 'text-red-600 dark:text-red-400'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'text-white',
      accent: 'bg-purple-100 dark:bg-purple-900/30',
      accentText: 'text-purple-600 dark:text-purple-400'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      icon: 'text-white',
      accent: 'bg-indigo-100 dark:bg-indigo-900/30',
      accentText: 'text-indigo-600 dark:text-indigo-400'
    },
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      icon: 'text-white',
      accent: 'bg-emerald-100 dark:bg-emerald-900/30',
      accentText: 'text-emerald-600 dark:text-emerald-400'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'text-white',
      accent: 'bg-orange-100 dark:bg-orange-900/30',
      accentText: 'text-orange-600 dark:text-orange-400'
    }
  };

  // Get color configuration with fallback to blue if color is not found
  const getColorConfig = () => {
    return colorClasses[color] || colorClasses.blue;
  };

  const colorConfig = getColorConfig();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    if (!trend) return null;
    
    const absValue = Math.abs(trend);
    const sign = trend > 0 ? '+' : trend < 0 ? '-' : '';
    const textColor = trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600';
    
    return (
      <span className={`text-sm font-semibold ${textColor}`}>
        {sign}{absValue}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent"></div>
      </div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </h3>
            {timeframe && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {timeframe}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorConfig.bg} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`h-6 w-6 ${colorConfig.icon}`} />
            </div>
          )}
        </div>
        
        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
            {percentage && (
              <span className={`text-lg font-semibold ${colorConfig.accentText}`}>
                {percentage}%
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Trend Indicator */}
        {trend !== null && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colorConfig.accent}`}>
            {getTrendIcon()}
            {getTrendText()}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              vs mois dernier
            </span>
          </div>
        )}
      </div>
      
      {/* Bottom Accent Line */}
      <div className={`h-1 bg-gradient-to-r ${colorConfig.bg}`}></div>
    </div>
  );
};

export default ModernStatsCard;
