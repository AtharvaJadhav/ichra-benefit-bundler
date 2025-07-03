import React from 'react';
interface ProgressStreamProps {
  progress: number;
  showPercentage?: boolean;
  height?: number;
  color?: string;
}
export const ProgressStream: React.FC<ProgressStreamProps> = ({
  progress,
  showPercentage = true,
  height = 8,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-500',
    indigo: 'bg-indigo-600'
  };
  const bgColorClass = colorClasses[color as keyof typeof colorClasses] || 'bg-blue-600';
  return <div className="w-full">
      <div className="relative">
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden`} style={{
        height: `${height}px`
      }}>
          <div className={`${bgColorClass} h-full rounded-full transition-all duration-300 ease-out`} style={{
          width: `${progress}%`
        }}></div>
        </div>
        {showPercentage && <div className="mt-1 text-sm text-gray-600 text-right">
            {Math.round(progress)}% Complete
          </div>}
      </div>
    </div>;
};