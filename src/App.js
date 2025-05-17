import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css';
import Header from './components/Header';
import NoiseLevel from './components/NoiseLevel';
import NoiseChart from './components/NoiseChart';
import AlertHistory from './components/AlertHistory';
import NoiseMap from './components/NoiseMap';
import { database } from './firebase';
import { ref, push, get} from 'firebase/database';

function App() {  const [threshold, setThreshold] = useState(85);  const [locations, setLocations] = useState([
    { id: 1, name: 'PTIT Ngọc Trục', position: [21.038249, 105.748479], currentNoise: 0 },
    { id: 2, name: 'PTIT Hà Đông', position: [20.980913, 105.78736], currentNoise: 0 },
  ]);
  const [selectedLocation, setSelectedLocation] = useState(1);
  const [noiseHistory, setNoiseHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);  // Hàm tải lịch sử độ ồn từ Firebase
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
  }, []);  // MQTT - Nhận dữ liệu từ ESP32 (PTIT Ngọc Trục)
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
  }, [loadNoiseHistoryFromFirebase, selectedLocation]);  // Dữ liệu mô phỏng cho PTIT Hà Đông (thay thế cho OpenSenseMap)
  useEffect(() => {
    const generateRandomNoise = () => {
      // Tạo giá trị ngẫu nhiên từ 40 đến 90 dB
      const base = 40; // Giá trị cơ sở
      const variation = Math.random() * 50; // Biến thiên ngẫu nhiên
      return parseFloat((base + variation).toFixed(1));
    };

    const fetchFakeNoise = async () => {
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
      } catch (error) {
        console.error('Lỗi khi tạo dữ liệu giả:', error);
      }
    };    
    
    // Giảm khoảng thời gian từ 30s xuống 10s để nhìn thấy sự thay đổi nhanh hơn
    const interval = setInterval(fetchFakeNoise, 10000);
    fetchFakeNoise();

    return () => clearInterval(interval);
  }, [selectedLocation]);  // Chỉ xử lý alert nếu vượt ngưỡng
  useEffect(() => {
    const selectedLoc = locations.find((loc) => loc.id === selectedLocation);
    if (selectedLoc && selectedLoc.currentNoise > threshold) {
      const alert = {
        time: new Date().toISOString(),
        level: selectedLoc.currentNoise,
        threshold: threshold // Lưu ngưỡng khi cảnh báo được tạo
      };

      setAlerts((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          level: selectedLoc.currentNoise,
          threshold: threshold // Lưu ngưỡng khi cảnh báo được tạo
        },
      ]);

      push(ref(database, `locations/${selectedLocation}/alerts`), alert);
    }
  }, [locations, selectedLocation, threshold]);
  
  // Ghi log khi dữ liệu thay đổi
  useEffect(() => {
    console.log(`Dữ liệu đồ thị đã được cập nhật cho địa điểm ID: ${selectedLocation}`);
    console.log(`Số lượng điểm dữ liệu: ${noiseHistory.length}`);
    if (noiseHistory.length > 0) {
      console.log(`Điểm dữ liệu cuối cùng: ${JSON.stringify(noiseHistory[noiseHistory.length - 1])}`);
    }
  }, [noiseHistory, selectedLocation]);// Tải lịch sử độ ồn và cảnh báo khi đổi địa điểm
  useEffect(() => {
    console.log(`Đang tải dữ liệu cho địa điểm ID: ${selectedLocation}`);
    const loadDataFromFirebase = async () => {
      // Tải lịch sử độ ồn bằng cách sử dụng hàm đã tạo trước đó
      await loadNoiseHistoryFromFirebase(selectedLocation);
        // Tải lịch sử cảnh báo
      const alertsRef = ref(database, `locations/${selectedLocation}/alerts`);
      try {
        const snapshot = await get(alertsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();          
          const alertArray = Object.values(data).map((entry) => ({
            time: new Date(entry.time).toLocaleTimeString(),
            level: entry.level,
            threshold: entry.threshold || threshold // Sử dụng ngưỡng đã lưu hoặc ngưỡng hiện tại
          }));
          // Chỉ hiển thị những cảnh báo vượt ngưỡng hiện tại
          const filteredAlerts = alertArray.filter(alert => alert.level > threshold);
          setAlerts(filteredAlerts.slice(-60)); // Hiển thị 60 điểm mới nhất
        } else {
          setAlerts([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải cảnh báo từ Firebase:', err);
      }
    };    loadDataFromFirebase();
  }, [selectedLocation, loadNoiseHistoryFromFirebase, threshold]);const handleLocationSelect = async (locationId) => {
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
      <Header setThreshold={setThreshold} alerts={alerts} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-gray-900 dark:text-white">
        {selectedLoc && (
          <>
            <NoiseLevel noiseLevel={selectedLoc.currentNoise} threshold={threshold} />            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NoiseChart noiseHistory={noiseHistory} locationName={selectedLoc.name} />
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
