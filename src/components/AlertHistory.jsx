import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const AlertHistory = ({ alerts, threshold }) => {
  // Đã có sắp xếp trong state

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Lịch sử cảnh báo (Ngưỡng hiện tại: {threshold} dB)
      </h2>
      <div className="overflow-y-auto max-h-64">
        {alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Không có cảnh báo nào</p>
        ) : (
          alerts.map((alert, index) => {
            // Xác định trạng thái hiện tại của cảnh báo
            const isCurrent = alert.currentStatus === 'exceeds_current' || alert.level > threshold;
            return (
              <div
                key={index}
                className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 ${
                  isCurrent 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'bg-amber-50 dark:bg-amber-900/10'
                }`}
              >
                {isCurrent ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-3" />
                )}                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className={`font-medium ${
                      isCurrent 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {alert.level} dB
                    </p>                    <p className={`text-xs px-2 py-1 rounded-full ${
                      alert.threshold !== threshold 
                        ? 'bg-orange-100 dark:bg-orange-900/20' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      Ngưỡng lúc đó: {alert.threshold !== undefined ? alert.threshold : threshold} dB
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{alert.time}</p>                  <p className={`text-xs mt-1 ${
                    isCurrent 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {alert.level > alert.threshold 
                      ? `Vượt ngưỡng lúc đó (${alert.threshold} dB)`
                      : `Không vượt ngưỡng lúc đó (${alert.threshold} dB)`
                    }
                    {alert.threshold !== threshold && ` • ${isCurrent 
                      ? `Vượt ngưỡng hiện tại (${threshold} dB)` 
                      : `Không vượt ngưỡng hiện tại (${threshold} dB)`}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertHistory;