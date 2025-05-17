import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import SettingsPanelHeader from './SettingsPanelHeader';

const Header = ({ setThreshold, alerts }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = alerts.map((alert, index) => ({
    id: index,
    message: `Noise level exceeded ${alert.level} dB`,
    time: alert.time,
  }));
  

  // Handler cho Settings
  const handleSettingsClick = () => {
    setShowSettings((prev) => !prev); // Toggle Settings
    setShowNotifications(false);      // Luôn tắt Notifications
  };

  // Handler cho Notifications
  const handleNotificationsClick = () => {
    setShowNotifications((prev) => !prev); // Toggle Notifications
    setShowSettings(false);                // Luôn tắt Settings
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hệ thống giám sát tiếng ồn
        </h1>
        <div className="flex items-center space-x-4">
          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={handleNotificationsClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            {showNotifications && (
              <NotificationsPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Settings Icon */}
          <div className="relative">
            <button
              onClick={handleSettingsClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>            {showSettings && (
              <SettingsPanelHeader
                setThreshold={setThreshold}
                onClose={() => setShowSettings(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;