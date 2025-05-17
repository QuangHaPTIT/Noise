import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const NoiseChart = ({ noiseHistory, locationName, threshold = 85 }) => {
  const isLoading = noiseHistory.length === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Mức độ tiếng ồn theo thời gian thực {locationName && `- ${locationName}`}
      </h2>
      <div className="h-96 relative">        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-800/60 z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={noiseHistory} 
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          >            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.3}
              horizontal={true}
              vertical={true}
              className="dark:[&>line]:stroke-gray-600"
            />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              className="dark:[&>text]:stroke-white"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#6b7280"
              className="dark:[&>text]:stroke-white"
              domain={[0, 'dataMax + 10']}
              label={{ 
                value: 'Độ ồn (dB)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fill: '#6b7280' },
                className: "dark:fill-white"
              }}
            />            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '8px 12px',
                color: '#000',
              }}
              animationDuration={300}
              animationEasing="ease-out"
              cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }}
              wrapperClassName="dark:[&>div]:bg-gray-900 dark:[&>div]:border-gray-700 dark:[&>div]:text-white"
              formatter={(value) => [`${value} dB`, 'Độ ồn']}
              labelFormatter={(time) => `Thời gian: ${time}`}
            />
            <Legend 
              wrapperStyle={{
                color: '#6b7280',
              }}
              className="dark:[&>div>svg]:text-white dark:[&>div]:text-white"
            />            <ReferenceLine 
              y={threshold} 
              stroke="#EF4444" 
              strokeWidth={1.5}
              strokeDasharray="5 5" 
              isFront={true}
            />{/* Đường chính hiển thị dữ liệu - cải tiến cho độ mượt tốt và chính xác */}
            <Line
              type="natural"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2.5}
              name="Mức độ tiếng ồn"
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 0 }}
              connectNulls={true}
              animationDuration={800}
              isAnimationActive={true}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dark:[&>path]:stroke-blue-400"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Hiển thị 120 điểm dữ liệu mới nhất từ cơ sở dữ liệu</p>
        <p className="mt-1">Đường đứt nét màu đỏ thể hiện ngưỡng an toàn</p>
        {locationName && (
          <p className="mt-1 font-medium text-blue-500 dark:text-blue-400">
            Đang hiển thị dữ liệu của: {locationName}
          </p>
        )}
      </div>
    </div>
  );
};

export default NoiseChart;