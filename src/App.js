import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css';
import Header from './components/Header';
import NoiseLevel from './components/NoiseLevel';
import NoiseChart from './components/NoiseChart';
import AlertHistory from './components/AlertHistory';
import NoiseMap from './components/NoiseMap';
import { database } from './firebase';
import { ref, push, get, update } from 'firebase/database';

function App() {
  // Lấy ngưỡng từ localStorage nếu có, hoặc sử dụng giá trị mặc định 85
  const [threshold, setThreshold] = useState(() => {
    const savedThreshold = localStorage.getItem('noiseThreshold');
    return savedThreshold ? parseInt(savedThreshold, 10) : 85;
  });
  
  const [locations, setLocations] = useState([
    { id: 1, name: 'PTIT Ngọc Trục', position: [21.038249, 105.748479], currentNoise: 0 },
    { id: 2, name: 'PTIT Hà Đông', position: [20.980913, 105.78736], currentNoise: 0 },
  ]);
  const [selectedLocation, setSelectedLocation] = useState(1);
  const [noiseHistory, setNoiseHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Hàm xử lý khi thay đổi ngưỡng tiếng ồn
  const handleThresholdChange = (newThreshold) => {
    // Lưu vào localStorage
    localStorage.setItem('noiseThreshold', newThreshold);
    // Cập nhật state
    setThreshold(newThreshold);
    // Tải lại danh sách cảnh báo với ngưỡng mới
    loadAlertsForLocation(selectedLocation);
  };

  // Hàm tạo cảnh báo độ ồn thời gian thực
  const createRealtimeAlert = React.useCallback((noiseValue, locationId, timestamp) => {
    if (noiseValue > threshold) {
      // Chuẩn bị cảnh báo để lưu vào Firebase
      const currentThreshold = threshold; // Lưu ngưỡng hiện tại vào biến riêng để đảm bảo giá trị chính xác
      const alert = {
        time: timestamp || new Date().toISOString(),
        level: noiseValue,
        threshold: currentThreshold, // Đảm bảo lưu đúng giá trị ngưỡng hiện tại
        status: 'current'
      };
      
      // Lưu cảnh báo vào Firebase
      push(ref(database, `locations/${locationId}/alerts`), alert);
      
      // Nếu đang xem địa điểm hiện tại, cập nhật cảnh báo ngay
      if (selectedLocation === locationId) {
        setAlerts(prev => {
          const newAlert = {            time: new Date(alert.time).toLocaleTimeString(),
            level: noiseValue,
            threshold: currentThreshold, // Đảm bảo sử dụng giá trị ngưỡng chính xác từ biến đã lưu
            timestamp: new Date(alert.time).getTime(),
            status: 'current'
          };
          
          return [newAlert, ...prev]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 60);
        });
      }
      
      console.log(`Cảnh báo mới: Mức độ ồn ${noiseValue}dB vượt ngưỡng ${threshold}dB`);
    }
  }, [threshold, selectedLocation]);  

  // Hàm xử lý cảnh báo có ngưỡng không hợp lệ
  const fixAlertThresholds = React.useCallback(async (locationId) => {
    try {
      // Lấy tất cả cảnh báo
      const alertsRef = ref(database, `locations/${locationId}/alerts`);
      const snapshot = await get(alertsRef);
      
      if (snapshot.exists()) {
        const updates = {};
        let hasUpdates = false;
        
        // Xem xét từng cảnh báo
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key;
          const alert = childSnapshot.val();
          
          // Kiểm tra nếu ngưỡng không hợp lệ
          if (alert.threshold === undefined || 
              typeof alert.threshold !== 'number' || 
              alert.threshold < 10) { // Ngưỡng dưới 10 có thể là lỗi
            
            // Sử dụng giá trị mặc định hợp lý dựa trên thời gian của cảnh báo
            const defaultThreshold = 85; // Ngưỡng mặc định an toàn
            updates[`${key}/threshold`] = defaultThreshold;
            hasUpdates = true;
          }
        });
        
        // Cập nhật các cảnh báo nếu cần
        if (hasUpdates) {
          const updateRef = ref(database, `locations/${locationId}/alerts`);
          await update(updateRef, updates);
          console.log('Đã sửa cảnh báo có ngưỡng không hợp lệ');
        }
      }
    } catch (err) {
      console.error('Lỗi khi sửa ngưỡng cảnh báo:', err);
    }
  }, []);
  // Hàm tải danh sách cảnh báo cho một địa điểm cụ thể
  const loadAlertsForLocation = React.useCallback(async (locationId) => {
    const alertsRef = ref(database, `locations/${locationId}/alerts`);
    try {
      const snapshot = await get(alertsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Kiểm tra và sửa ngưỡng cho các cảnh báo lỗi
        let shouldFixAlerts = false;
        for (const key in data) {
          if (data[key].threshold === undefined || 
              typeof data[key].threshold !== 'number' || 
              data[key].threshold < 10) { // Ngưỡng dưới 10 có thể là lỗi
            shouldFixAlerts = true;
            break;
          }
        }
        
        // Nếu phát hiện cảnh báo lỗi, thực hiện sửa chữa
        if (shouldFixAlerts) {
          console.log('Đã phát hiện cảnh báo với ngưỡng không hợp lệ, đang sửa chữa...');
          fixAlertThresholds(locationId);
        }
        
        const alertArray = Object.values(data).map((entry) => {
          // Đảm bảo ngưỡng là một giá trị hợp lệ
          const entryThreshold = entry.threshold !== undefined ? entry.threshold : threshold;
          
          // Sửa lại cách xác định trạng thái: Chỉ so sánh với ngưỡng được lưu trong entry
          return {
            time: new Date(entry.time).toLocaleTimeString(),
            level: entry.level,
            threshold: entryThreshold, // Sử dụng ngưỡng đã lưu trong entry
            timestamp: new Date(entry.time).getTime(), // Thêm timestamp để sắp xếp
            // Thêm trạng thái để phân biệt cảnh báo vượt ngưỡng hiện tại và cảnh báo cũ
            // Trạng thái chỉ dựa vào việc vượt ngưỡng lúc tạo cảnh báo hay không
            status: entry.level > entry.threshold ? 'exceeded_original' : 'normal_at_original',
            // Trạng thái so với ngưỡng hiện tại
            currentStatus: entry.level > threshold ? 'exceeds_current' : 'normal_at_current'
          };
        });
        
        // Sắp xếp theo thời gian mới nhất trước
        const sortedAlerts = alertArray.sort((a, b) => b.timestamp - a.timestamp);
        
        // Lấy tất cả cảnh báo nhưng đánh dấu trạng thái
        setAlerts(sortedAlerts.slice(0, 60)); // Hiển thị 60 điểm mới nhất
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải cảnh báo từ Firebase:', err);
    }
  }, [threshold, fixAlertThresholds]);

  // Hàm tải lịch sử độ ồn từ Firebase
  const loadNoiseHistoryFromFirebase = React.useCallback(async (locationId) => {
    console.log(`Đang tải lịch sử độ ồn cho địa điểm ID: ${locationId}`);
    const historyRef = ref(database, `locations/${locationId}/history`);
    try {
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.values(data).map((entry) => ({
          time: new Date(entry.time).toLocaleTimeString(),
          value: entry.noise,
          timestamp: new Date(entry.time).getTime() // Thêm timestamp để sắp xếp
        }));
          // Sắp xếp theo thời gian
        historyArray.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`Đã tải ${historyArray.length} điểm dữ liệu, hiển thị 60 điểm mới nhất`);
        console.log(`Địa điểm đang tải: ${locationId}`);
        setNoiseHistory(historyArray.slice(-60)); // Hiển thị 60 điểm mới nhất
      } else {
        console.log(`Không tìm thấy dữ liệu lịch sử cho địa điểm ID: ${locationId}`);
        setNoiseHistory([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử độ ồn từ Firebase:', err);
    }
  }, []);

  // MQTT - Nhận dữ liệu từ ESP32 (PTIT Ngọc Trục)
  useEffect(() => {
    const client = mqtt.connect('wss://09e948bd2b80418f8fa4c4f9765322bf.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'admin',
      password: 'Esp32_admin',
      protocol: 'wss',
    });

    client.on('connect', () => {
      console.log('Connected to MQTT Broker');
      client.subscribe('esp32/noise_level/#', (err) => {
        if (err) console.error('Subscribe error:', err);
      });
    });    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        const noiseValue = parseFloat(data.noise);
        const locationId = 1; // PTIT Ngọc Trục
        console.log('Received data:', data);
        if (!isNaN(noiseValue)) {
          // Cập nhật giá trị hiện tại
          setLocations((prev) =>
            prev.map((loc) => (loc.id === locationId ? { ...loc, currentNoise: noiseValue } : loc))
          );

          const timestamp = new Date().toISOString();
          
          // Lưu vào Firebase
          push(ref(database, `locations/${locationId}/history`), {
            time: timestamp,
            noise: noiseValue,
          });
          
          // Nếu đang ở địa điểm này, cập nhật trực tiếp vào noiseHistory để hiển thị ngay
          if (selectedLocation === locationId) {
            // Thêm điểm dữ liệu mới vào cuối mảng và giữ 60 điểm gần nhất
            setNoiseHistory(prev => {
              const newItem = {
                time: new Date(timestamp).toLocaleTimeString(),
                value: noiseValue,
                timestamp: new Date(timestamp).getTime()
              };
              // Tạo mảng mới chỉ giữ 59 điểm gần nhất và thêm điểm mới vào cuối
              const updatedHistory = [...prev.slice(-59), newItem];
              return updatedHistory;
            });
          }

          // Tạo cảnh báo thời gian thực nếu vượt ngưỡng
          createRealtimeAlert(noiseValue, locationId, timestamp);
        }
      } catch (err) {
        console.error('Lỗi phân tích dữ liệu MQTT:', err);
      }
    });

    client.on('error', (err) => {
      console.error('Connection error: ', err);
      client.end(true);
    });    return () => {
      if (client.connected) {
        client.end();
      }
    };
  }, [loadNoiseHistoryFromFirebase, selectedLocation, createRealtimeAlert]);

  // Dữ liệu mô phỏng cho PTIT Hà Đông (thay thế cho OpenSenseMap)
  useEffect(() => {
    const generateRandomNoise = () => {
      // Tạo giá trị ngẫu nhiên từ 40 đến 90 dB
      const base = 40; // Giá trị cơ sở
      const variation = Math.random() * 50; // Biến thiên ngẫu nhiên
      return parseFloat((base + variation).toFixed(1));
    };    const fetchFakeNoise = async () => {
      try {
        // Tạo giá trị giả thay vì gọi API
        const noiseValue = generateRandomNoise();
        const locationId = 2; // PTIT Hà Đông

        setLocations((prev) =>
          prev.map((loc) => (loc.id === locationId ? { ...loc, currentNoise: noiseValue } : loc))
        );

        const timestamp = new Date().toISOString();
        
        // Lưu vào Firebase
        push(ref(database, `locations/${locationId}/history`), {
          time: timestamp,
          noise: noiseValue,
        });
        
        // Nếu đang ở địa điểm này, cập nhật trực tiếp vào noiseHistory để hiển thị ngay
        if (selectedLocation === locationId) {
          // Thêm điểm dữ liệu mới vào cuối mảng và giữ 60 điểm gần nhất
          setNoiseHistory(prev => {
            const newItem = {
              time: new Date(timestamp).toLocaleTimeString(),
              value: noiseValue,
              timestamp: new Date(timestamp).getTime()
            };
            // Tạo mảng mới chỉ giữ 59 điểm gần nhất và thêm điểm mới vào cuối
            const updatedHistory = [...prev.slice(-59), newItem];
            return updatedHistory;
          });
        }

        // Tạo cảnh báo thời gian thực nếu vượt ngưỡng
        createRealtimeAlert(noiseValue, locationId, timestamp);
      } catch (error) {
        console.error('Lỗi khi tạo dữ liệu giả:', error);
      }
    };
    
    // Giảm khoảng thời gian từ 30s xuống 10s để nhìn thấy sự thay đổi nhanh hơn
    const interval = setInterval(fetchFakeNoise, 10000);
    fetchFakeNoise();

    return () => clearInterval(interval);
  }, [selectedLocation, createRealtimeAlert]);  // Chỉ theo dõi trạng thái hiện tại của địa điểm đã chọn
  useEffect(() => {
    const selectedLoc = locations.find((loc) => loc.id === selectedLocation);
    if (selectedLoc) {
      console.log(`Trạng thái địa điểm ${selectedLoc.name}: ${selectedLoc.currentNoise} dB (Ngưỡng: ${threshold} dB)`);
    }
  }, [locations, selectedLocation, threshold]);
  
  // Ghi log khi dữ liệu thay đổi
  useEffect(() => {
    console.log(`Dữ liệu đồ thị đã được cập nhật cho địa điểm ID: ${selectedLocation}`);
    console.log(`Số lượng điểm dữ liệu: ${noiseHistory.length}`);
    if (noiseHistory.length > 0) {
      console.log(`Điểm dữ liệu cuối cùng: ${JSON.stringify(noiseHistory[noiseHistory.length - 1])}`);
    }
  }, [noiseHistory, selectedLocation]);
  // Tải lịch sử độ ồn và cảnh báo khi đổi địa điểm
  useEffect(() => {
    console.log(`Đang tải dữ liệu cho địa điểm ID: ${selectedLocation}`);
    const loadDataFromFirebase = async () => {
      // Tải lịch sử độ ồn bằng cách sử dụng hàm đã tạo trước đó
      await loadNoiseHistoryFromFirebase(selectedLocation);
      // Tải lịch sử cảnh báo bằng cách sử dụng hàm đã tạo trước đó
      await loadAlertsForLocation(selectedLocation);
    };
    
    loadDataFromFirebase();
  }, [selectedLocation, loadNoiseHistoryFromFirebase, loadAlertsForLocation, threshold]);

  const handleLocationSelect = async (locationId) => {
    // Chỉ thực hiện khi chọn địa điểm khác với địa điểm hiện tại
    if (locationId !== selectedLocation) {
      console.log(`Chuyển đến địa điểm: ${locationId}`);
      
      // Tìm tên địa điểm mới dựa trên ID
      const newLocation = locations.find(loc => loc.id === locationId);
      
      // Hiển thị thông báo chuyển đổi 
      console.log(`Đang tải dữ liệu cho địa điểm: ${newLocation?.name}`);
      
      // Xóa dữ liệu cũ để hiển thị trạng thái loading
      setNoiseHistory([]);
      
      // Cập nhật địa điểm đã chọn
      setSelectedLocation(locationId);
      
      // Tải dữ liệu mới ngay lập tức
      await loadNoiseHistoryFromFirebase(locationId);
      
      // useEffect với dependency [selectedLocation] sẽ tự động tải dữ liệu cảnh báo
    }
  };

  const selectedLoc = locations.find((loc) => loc.id === selectedLocation);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header setThreshold={handleThresholdChange} alerts={alerts} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-gray-900 dark:text-white">
        {selectedLoc && (
          <>
            <NoiseLevel noiseLevel={selectedLoc.currentNoise} threshold={threshold} />            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">              <div className="lg:col-span-2">
                <NoiseChart noiseHistory={noiseHistory} locationName={selectedLoc.name} threshold={threshold} />
              </div>
              <div className="space-y-6">
                <NoiseMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  threshold={threshold}
                />
                <AlertHistory alerts={alerts} threshold={threshold} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
