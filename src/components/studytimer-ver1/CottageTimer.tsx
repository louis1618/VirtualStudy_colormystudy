"use client";

import { useState, useEffect, useRef } from 'react';
import { FiClock, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';

type CottageTimerProps = {
  timeFormat?: '24h' | '12h';
  focusTask?: string;
  remainingMinutes?: number;
  playSound?: boolean; // 알림 소리 재생 여부
  autoStart?: boolean; // 타이머 자동 시작 여부
};

export default function CottageTimer({ 
  timeFormat = '24h', 
  focusTask = '집중하기',
  remainingMinutes = 60,
  playSound = true,
  autoStart = false
}: CottageTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState(remainingMinutes * 60); // 분을 초로 변환
  const [isActive, setIsActive] = useState(autoStart); // autoStart가 true면 자동 시작
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 오디오 요소 생성
  useEffect(() => {
    audioRef.current = new Audio('/audio/notification.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // remainingMinutes prop이 변경되면 타이머 리셋
  useEffect(() => {
    setRemainingTime(remainingMinutes * 60);
    if (autoStart) {
      setIsActive(true);
      setIsPaused(false);
    }
  }, [remainingMinutes, autoStart]);
  
  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 카운트다운 타이머
  useEffect(() => {
    if (!isActive || isPaused || remainingTime <= 0) return;
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // 타이머 종료 시 알림음 재생
          if (playSound && audioRef.current) {
            audioRef.current.play().catch(err => console.error('알림음 재생 실패:', err));
          }
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isActive, isPaused, remainingTime, playSound]);
  
  // 타이머 시작/일시정지
  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };
  
  // 타이머 리셋
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setRemainingTime(remainingMinutes * 60);
  };
  
  // 시간 포맷팅
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let period = '';
    
    if (timeFormat === '12h') {
      period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0시는 12시로 표시
    }
    
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}${period ? ' ' + period : ''}`;
  };
  
  // 카운트다운 포맷팅
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 진행률 계산
  const progress = Math.max(0, (remainingTime / (remainingMinutes * 60)) * 100);
  
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 text-white shadow-lg">
      <div className="flex items-center gap-3">
        {/* 현재 시간 */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
          <div className="text-xs opacity-50">현재 시간</div>
        </div>
        
        {/* 구분선 */}
        <div className="h-10 w-px bg-white/20"></div>
        
        {/* 타이머 */}
        <div className="flex flex-col">
          <div className="text-sm opacity-70 mb-1 truncate max-w-[120px]">{focusTask}</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{formatCountdown(remainingTime)}</span>
            
            <div className="flex gap-1">
              <button 
                onClick={toggleTimer}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                aria-label={isActive && !isPaused ? "일시정지" : "시작"}
              >
                {isActive && !isPaused ? <FiPause size={12} /> : <FiPlay size={12} />}
              </button>
              <button 
                onClick={resetTimer}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                aria-label="리셋"
              >
                <FiRefreshCw size={12} />
              </button>
            </div>
          </div>
          
          {/* 진행 바 */}
          <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
