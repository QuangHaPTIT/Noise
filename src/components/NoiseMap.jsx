import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';

// Sửa lỗi biểu tượng
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});  // Tạo biểu tượng màu khác nhau
const greenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  shadowSize: [41, 41],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const redIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  shadowSize: [41, 41],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Biểu tượng được chọn (lớn hơn để nổi bật)
const selectedGreenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [40, 40],
  shadowSize: [41, 41],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const selectedRedIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [40, 40],
  shadowSize: [41, 41],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Component để điều khiển các chức năng của bản đồ
function MapControls({ locations }) {
  const map = useMap();
  
  const fitAllMarkers = () => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => loc.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar">
        <a 
          href="#" 
          title="Hiển thị tất cả điểm đo"
          onClick={(e) => {
            e.preventDefault();
            fitAllMarkers();
          }}
          className="flex items-center justify-center bg-white w-8 h-8 text-xl"
        >
          <span>🔍</span>
        </a>
      </div>
    </div>
  );
}

// Component chú thích bản đồ có thể đóng/mở
function MapLegend() {
  const [isVisible, setIsVisible] = useState(true);
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  return (
    <div className="absolute bottom-2 right-2 z-[1000]">
      {isVisible ? (
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow animate-fadein border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Chú thích bản đồ</span>
            <button 
              onClick={toggleVisibility}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
              title="Ẩn chú thích"
            >
              ×
            </button>
          </div>
          <div className="flex items-center text-xs mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">An toàn</span>
          </div>
          <div className="flex items-center text-xs mb-2">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Vượt ngưỡng</span>
          </div>
          <div className="text-xs text-center mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
            <span className="text-gray-700 dark:text-gray-300">Nhấp vào điểm đánh dấu để xem dữ liệu</span>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleVisibility}
          className="bg-white dark:bg-gray-800 px-3 py-2 rounded shadow text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          title="Hiện chú thích"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hiện chú thích
          </span>
        </button>
      )}
    </div>
  );
}

// Component để cập nhật view khi selectedLocation thay đổi
function ChangeView({ location, previousLocation }) {
  const map = useMap();
  
  // Fit to all markers on first load
  useEffect(() => {
    if (location && !previousLocation) {
      // Nếu đây là lần đầu tiên, fit vào tất cả các marker
      const bounds = L.latLngBounds([location.position]);
      map.fitBounds(bounds.pad(0.5));
    }
  }, []);
    useEffect(() => {
    // Chỉ di chuyển bản đồ khi địa điểm đã thay đổi
    if (previousLocation && location && map && location.id !== previousLocation.id) {
      console.log(`Đang di chuyển bản đồ đến địa điểm: ${location.name}`);
      map.setView(location.position, 14, {
        animate: true,
        duration: 1 // Thời gian di chuyển 1 giây
      });
    }
  }, [location, previousLocation, map]);
  
  return null;
}

const NoiseMap = ({ locations, selectedLocation, onLocationSelect, threshold }) => {
  const selectedLoc = locations.find(loc => loc.id === selectedLocation);
  const [previousLoc, setPreviousLoc] = useState(null);
  
  useEffect(() => {
    // Khi selectedLocation thay đổi, cập nhật previousLoc
    setPreviousLoc(locations.find(loc => loc.id === selectedLocation));
  }, [selectedLocation, locations]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        Bản đồ giám sát độ ồn
      </h2><MapContainer 
        center={selectedLoc?.position || [21.0285, 105.8542]} 
        zoom={14} 
        style={{ height: '300px', width: '100%', zIndex: 0 }} 
        className="rounded-lg" 
        dragging={true}
        scrollWheelZoom={true}
      >        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" class="text-blue-500">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:brightness-[0.7] dark:contrast-[1.2] dark:saturate-[0.8]"
        />
        {selectedLoc && previousLoc && <ChangeView location={selectedLoc} previousLocation={previousLoc} />}
        <MapControls locations={locations} />
        {locations.map((loc) => (        <Marker
          key={loc.id}
          position={loc.position}
          icon={loc.id === selectedLocation 
            ? (loc.currentNoise > threshold ? selectedRedIcon : selectedGreenIcon) 
            : (loc.currentNoise > threshold ? redIcon : greenIcon)
          }
          eventHandlers={{
            click: () => onLocationSelect(loc.id),
          }}
        >          <Popup>
            <div className="text-center">
              <strong>{loc.name}</strong><br />
              <span className={loc.currentNoise > threshold ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                {loc.currentNoise.toFixed(1)} dB
              </span><br />
              <span className="text-xs mb-2 block">
                {loc.currentNoise > threshold ? "Vượt ngưỡng" : "An toàn"}
              </span>
              <button 
                onClick={() => {
                  const wasSelected = loc.id === selectedLocation;
                  onLocationSelect(loc.id);
                  // Đóng popup sau khi chọn để người dùng có thể thấy đồ thị
                  const popupElement = document.querySelector('.leaflet-popup-close-button');
                  if (popupElement) popupElement.click();
                  
                  // Thông báo trong console
                  console.log(`Người dùng đã chọn địa điểm: ${loc.name} (ID: ${loc.id})`);
                  if (wasSelected) {
                    console.log('Đang cập nhật dữ liệu cho địa điểm hiện tại');
                  } else {
                    console.log('Đang chuyển sang địa điểm mới');
                  }
                }}
                className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {loc.id === selectedLocation ? 'Cập nhật dữ liệu' : 'Xem dữ liệu chi tiết'}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}        <MapLegend />
    </MapContainer>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
      <div>Ngưỡng: <span className="font-medium">{threshold} dB</span></div>
      <div>Điểm đo: <span className="font-medium">{locations.length}</span></div>
    </div>
    
    <div className="mt-2 flex gap-2 justify-center">
      {locations.map(loc => (
        <button 
          key={loc.id}
          onClick={() => onLocationSelect(loc.id)}
          className={`px-2 py-1 text-xs rounded ${
            selectedLocation === loc.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {loc.name}
        </button>
      ))}
    </div>
  </div>
  );
};

export default NoiseMap;
