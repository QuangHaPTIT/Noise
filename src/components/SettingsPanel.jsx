import React from 'react';

const SettingsPanel = ({ threshold, setThreshold }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Cài đặt
      </h2>
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Ngưỡng tiếng ồn (dB)
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="mt-1 block w-32 rounded-md border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
              shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 
              focus:ring-opacity-50 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;