import React from 'react';
import { Volume2 } from 'lucide-react';

const NoiseLevel = ({ noiseLevel, threshold }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mức độ tiếng ồn hiện tại
          </h2>
          <div className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            {noiseLevel} dB
            <span
              className={`ml-2 text-sm ${
                noiseLevel > threshold ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
              }`}
            >
              {noiseLevel > threshold ? 'Vượt ngưỡng' : 'Bình thường'}
            </span>
          </div>
        </div>
        <Volume2
          className={`w-16 h-16 ${
            noiseLevel > threshold ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
          }`}
        />
      </div>
    </div>
  );
};

export default NoiseLevel;