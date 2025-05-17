import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertHistory = ({ alerts, threshold }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Lịch sử cảnh báo
      </h2>
      <div className="overflow-y-auto max-h-64">
        {alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Không có cảnh báo nào</p>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {alert.level} dB - {alert.threshold ? 
                    `Vượt ngưỡng ${alert.threshold} dB` : 
                    `Ngưỡng bị vượt quá`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">{alert.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertHistory;