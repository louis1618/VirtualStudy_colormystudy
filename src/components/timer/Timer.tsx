"use client";

import { useState, useEffect } from 'react';
import { FiClock, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';

type TimerProps = {
  onTimeUpdate: (seconds: number) => void;
};

export default function Timer({ onTimeUpdate }: TimerProps) {
  const [focusTime, setFocusTime] = useState(25); // 기본 25분 집중
  const [breakTime, setBreakTime] = useState(5); // 기본 5분 휴식
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [lastTick, setLastTick] = useState(0);
  
  // 타이머 시작/정지
  const toggleTimer = () => {
    if (!isActive) {
      setLastTick(Date.now());
    }
    setIsActive(!isActive);
  };
  
  // 타이머 리셋
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusTime * 60);
  };
  
  // 집중 시간 변경
  const handleFocusTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setFocusTime(newTime);
    if (!isActive && !isBreak) {
      setTimeLeft(newTime * 60);
    }
  };
  
  // 휴식 시간 변경
  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setBreakTime(newTime);
  };
  
  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTick) / 1000);
        
        if (delta >= 1) {
          setLastTick(now);
          setTimeLeft(prev => {
            const newTime = prev - delta;
            
            // 타이머 종료 시
            if (newTime <= 0) {
              // 알림 소리 재생
              const audio = new Audio('/notification.mp3');
              audio.play();
              
              // 집중 모드였다면 휴식 모드로, 휴식 모드였다면 집중 모드로 전환
              if (!isBreak) {
                // 집중 시간이 끝났을 때 공부 시간 업데이트
                onTimeUpdate(focusTime * 60);
                setIsBreak(true);
                return breakTime * 60;
              } else {
                setIsBreak(false);
                return focusTime * 60;
              }
            }
            
            return newTime;
          });
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, lastTick, isBreak, focusTime, breakTime, onTimeUpdate]);
  
  // 시간 포맷 (초 -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        <FiClock className="inline-block mr-2" />
        {isBreak ? '휴식 시간' : '집중 시간'}
      </h3>
      
      <div className="flex justify-center mb-6">
        <div className={`text-5xl font-bold ${isBreak ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full ${
            isActive
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          aria-label={isActive ? '일시정지' : '시작'}
        >
          {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="리셋"
        >
          <FiRefreshCw size={24} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            집중 시간 (분)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={focusTime}
            onChange={handleFocusTimeChange}
            disabled={isActive}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            휴식 시간 (분)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={breakTime}
            onChange={handleBreakTimeChange}
            disabled={isActive}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
