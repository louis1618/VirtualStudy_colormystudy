"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiX } from 'react-icons/fi';
import { FaFire, FaClock, FaCloudSun, FaCloudRain, FaSnowflake } from 'react-icons/fa';

type CottageControlsProps = {
  timeOfDay: 'day' | 'night';
  weatherType: 'clear' | 'rainy' | 'snowy';
  hasFireplace: boolean;
  timeFormat: '24h' | '12h';
  onTimeChange: (time: 'day' | 'night') => void;
  onWeatherChange: (weather: 'clear' | 'rainy' | 'snowy') => void;
  onFireplaceToggle: () => void;
  onTimeFormatChange: (format: '24h' | '12h') => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
};

export default function CottageControls({
  timeOfDay,
  weatherType,
  hasFireplace,
  timeFormat,
  onTimeChange,
  onWeatherChange,
  onFireplaceToggle,
  onTimeFormatChange,
  isOpen,
  onClose,
  isMobile = false
}: CottageControlsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!mounted || !isOpen) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          aria-label="설정 닫기"
        >
          <FiX size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">환경 설정</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">시간 설정</h3>
              <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-1.5">
                <button
                  onClick={() => onTimeChange('day')}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    timeOfDay === 'day'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                  aria-label="낮 모드"
                >
                  <FiSun className={`mr-2 ${timeOfDay === 'day' ? 'text-yellow-300' : ''}`} size={18} />
                  <span className="text-base">낮</span>
                </button>
                <button
                  onClick={() => onTimeChange('night')}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    timeOfDay === 'night'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                  aria-label="밤 모드"
                >
                  <FiMoon className={`mr-2 ${timeOfDay === 'night' ? 'text-blue-300' : ''}`} size={18} />
                  <span className="text-base">밤</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">날씨 설정</h3>
              <div className="grid grid-cols-3 bg-white/10 backdrop-blur-md rounded-xl p-1.5 gap-1.5">
                <button
                  onClick={() => onWeatherChange('clear')}
                  className={`py-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    weatherType === 'clear'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                  aria-label="맑음"
                >
                  <FaCloudSun className={`mr-1.5 ${weatherType === 'clear' ? 'text-yellow-300' : ''}`} size={17} />
                  <span className="text-base">맑음</span>
                </button>
                <button
                  onClick={() => onWeatherChange('rainy')}
                  className={`py-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    weatherType === 'rainy'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                  aria-label="비"
                >
                  <FaCloudRain className={`mr-1.5 ${weatherType === 'rainy' ? 'text-blue-400' : ''}`} size={17} />
                  <span className="text-base">비</span>
                </button>
                <button
                  onClick={() => onWeatherChange('snowy')}
                  className={`py-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    weatherType === 'snowy'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                  aria-label="눈"
                >
                  <FaSnowflake className={`mr-1.5 ${weatherType === 'snowy' ? 'text-blue-200' : ''}`} size={17} />
                  <span className="text-base">눈</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">추가 설정</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={onFireplaceToggle}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    hasFireplace
                      ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 active:bg-white/20'
                  }`}
                  aria-label={hasFireplace ? '벽난로 끄기' : '벽난로 켜기'}
                >
                  <FaFire className={`mr-2 ${hasFireplace ? 'text-orange-400' : ''}`} size={18} />
                  <span className="text-base">벽난로 {hasFireplace ? '켜짐' : '꺼짐'}</span>
                </button>
                
                <button
                  onClick={() => onTimeFormatChange(timeFormat === '24h' ? '12h' : '24h')}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/15 active:bg-white/20 transition-all duration-200`}
                  aria-label={timeFormat === '24h' ? '12시간제로 전환' : '24시간제로 전환'}
                >
                  <FaClock className="mr-2" size={18} />
                  <span className="text-base">{timeFormat === '24h' ? '24시간제' : '12시간제'}</span>
                </button>
                
                <button
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                  }}
                  className={`py-3 px-4 rounded-xl flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/15 active:bg-white/20 transition-all duration-200`}
                  aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                >
                  {theme === 'dark' ? (
                    <>
                      <FiSun className="mr-2 text-yellow-300" size={18} />
                      <span className="text-base">라이트 모드로 전환</span>
                    </>
                  ) : (
                    <>
                      <FiMoon className="mr-2 text-blue-300" size={18} />
                      <span className="text-base">다크 모드로 전환</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
