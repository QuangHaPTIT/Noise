import React from 'react';

const NotificationsPanel = ({ notifications, onClose }) => {
  return (
    <div className="absolute top-16 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80 p-4 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Thông báo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="mt-2 max-h-48 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.time}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không có thông báo
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;