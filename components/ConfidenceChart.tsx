import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ConfidenceChartProps {
  score: number;
}

export const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ score }) => {
  // Ensure score is 0-100
  const validScore = Math.min(Math.max(score, 0), 100);
  
  const data = [
    {
      name: 'Confidence',
      value: validScore,
      fill: validScore > 80 ? '#22c55e' : validScore > 50 ? '#eab308' : '#ef4444',
    },
  ];

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={10} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-sm font-bold text-slate-700">{Math.round(validScore)}%</span>
        <span className="text-[0.6rem] text-slate-500 uppercase">AI Conf.</span>
      </div>
    </div>
  );
};
