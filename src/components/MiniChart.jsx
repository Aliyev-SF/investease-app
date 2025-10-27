// src/components/MiniChart.jsx
// Compact sparkline chart for showing price trends in Market table

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * MiniChart Component - Sparkline for Price Trends
 * 
 * Displays a tiny line chart showing recent price history.
 * Color-coded: Green for uptrend, Red for downtrend.
 * Hover to see % change over period.
 * 
 * @param {Array} data - Array of price history objects [{date, close}, ...]
 * @param {number} width - Chart width in pixels (default: 80)
 * @param {number} height - Chart height in pixels (default: 40)
 */
function MiniChart({ data = [], width = 80, height = 40 }) {
  // If no data or too little data, show placeholder
  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-gray-400 text-xs"
        style={{ width, height }}
      >
        —
      </div>
    );
  }

  // Calculate % change from first to last data point
  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const percentChange = firstPrice > 0 
    ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)
    : 0;
  
  const isUptrend = parseFloat(percentChange) >= 0;
  const lineColor = isUptrend ? '#48bb78' : '#f56565'; // success green or danger red

  // Custom tooltip to show % change
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const price = payload[0].value;
      const date = payload[0].payload.date;
      
      return (
        <div className="bg-dark text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <div className="font-semibold">${price?.toFixed(2)}</div>
          <div className="text-gray-300">{date}</div>
          <div className={`font-semibold mt-1 ${isUptrend ? 'text-success' : 'text-danger'}`}>
            {isUptrend ? '+' : ''}{percentChange}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MiniChart;