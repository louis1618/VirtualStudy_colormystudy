"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiClock, FiCloud, FiCloudSnow, FiCloudRain } from 'react-icons/fi';

type RoomControlsProps = {
  timeOfDay: 'day' | 'night';
  weatherType: 'clear' | 'rainy' | 'snowy';
  hasFireplace: boolean;
  onTimeChange: (time: 'day' | 'night') => void;
  onWeatherChange: (weather: 'clear' | 'rainy' | 'snowy') => void;
  onFireplaceToggle: () => void;
};

export default function RoomControls({
  timeOfDay,
  weatherType,
  hasFireplace,
  onTimeChange,
  onWeatherChange,
  onFireplaceToggle
}: RoomControlsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 컴포넌트가 마운트된 후에만 UI를 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 시간 설정 */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">시간</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onTimeChange('day')}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
              timeOfDay === 'day'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="낮 모드"
          >
            <FiSun className="mr-1" />
            <span>낮</span>
          </button>
          <button
            onClick={() => onTimeChange('night')}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
              timeOfDay === 'night'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="밤 모드"
          >
            <FiMoon className="mr-1" />
            <span>밤</span>
          </button>
        </div>
      </div>
      
      {/* 날씨 설정 */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">날씨</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onWeatherChange('clear')}
            className={`flex-1 py-2 px-2 rounded-md flex items-center justify-center ${
              weatherType === 'clear'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="맑음"
          >
            <FiCloud className="mr-1" />
            <span>맑음</span>
          </button>
          <button
            onClick={() => onWeatherChange('rainy')}
            className={`flex-1 py-2 px-2 rounded-md flex items-center justify-center ${
              weatherType === 'rainy'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="비"
          >
            <FiCloudRain className="mr-1" />
            <span>비</span>
          </button>
          <button
            onClick={() => onWeatherChange('snowy')}
            className={`flex-1 py-2 px-2 rounded-md flex items-center justify-center ${
              weatherType === 'snowy'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="눈"
          >
            <FiCloudSnow className="mr-1" />
            <span>눈</span>
          </button>
        </div>
      </div>
      
      {/* 벽난로 설정 */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">벽난로</h3>
        <div className="flex">
          <button
            onClick={onFireplaceToggle}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
              hasFireplace
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label={hasFireplace ? '벽난로 끄기' : '벽난로 켜기'}
          >
            <span>{hasFireplace ? '켜짐' : '꺼짐'}</span>
          </button>
        </div>
      </div>
      
      {/* 테마 설정 (UI 테마, 다크모드) */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UI 테마</h3>
        <div className="flex">
          <button
            onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              document.documentElement.classList.toggle('dark');
            }}
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? (
              <>
                <FiSun className="mr-1" />
                <span>라이트 모드</span>
              </>
            ) : (
              <>
                <FiMoon className="mr-1" />
                <span>다크 모드</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
