"use client";

import { useState, useEffect } from 'react';

type StudyTimerProps = {
  startTime: Date;
  durationMinutes: number;
  focusTask: string;
  isVisible: boolean;
};

export default function StudyTimer({ startTime, durationMinutes, focusTask, isVisible }: StudyTimerProps) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [remaining, setRemaining] = useState('00:00:00');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDurationMs = durationMinutes * 60 * 1000;
    const initialRemainingHours = Math.floor(durationMinutes / 60);
    const initialRemainingMinutes = durationMinutes % 60;
    
    const formattedInitialRemaining = [
      initialRemainingHours.toString().padStart(2, '0'),
      initialRemainingMinutes.toString().padStart(2, '0'),
      '00'
    ].join(':');
    
    setRemaining(formattedInitialRemaining);
    setElapsed('00:00:00');
    setProgress(0);
    setIsTimeUp(false);
  }, [durationMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const totalDurationMs = durationMinutes * 60 * 1000;

      // 경과 시간 계산
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

      const formattedElapsed = [
        elapsedHours.toString().padStart(2, '0'),
        elapsedMinutes.toString().padStart(2, '0'),
        elapsedSeconds.toString().padStart(2, '0')
      ].join(':');

      setElapsed(formattedElapsed);

      // 남은 시간 계산
      const endTime = new Date(startTime.getTime() + totalDurationMs);
      const remainingMs = endTime.getTime() - now.getTime();

      // 진행률 계산 (0-100)
      const calculatedProgress = Math.min(100, (elapsedMs / totalDurationMs) * 100);
      setProgress(calculatedProgress);

      if (remainingMs <= 0) {
        setRemaining('00:00:00');
        setIsTimeUp(true);
        setProgress(100);
        clearInterval(timer);
        return;
      }

      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      const formattedRemaining = [
        remainingHours.toString().padStart(2, '0'),
        remainingMinutes.toString().padStart(2, '0'),
        remainingSeconds.toString().padStart(2, '0')
      ].join(':');

      setRemaining(formattedRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, durationMinutes]);

  return (
    <div
      className={`mt-6 transition-all duration-700 ease-in-out select-none ${
        isVisible
          ? 'opacity-100 transform translate-y-0'
          : 'opacity-0 transform translate-y-4 pointer-events-none'
      }`}
    >
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        {/* 상단 헤더 영역 */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-5 relative">
          <h2 className="text-gray-100 text-xl font-medium tracking-tight truncate">
            {focusTask}
          </h2>
          <div className="mt-3 bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 타이머 정보 영역 */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* 공부한 시간 */}
          <div className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-750 hover:shadow-lg hover:shadow-purple-900/20 transition-all">
            <p className="text-gray-400 text-sm font-medium mb-1">공부한 시간</p>
            <p className="text-3xl font-semibold font-mono text-indigo-400">{elapsed}</p>
          </div>

          {/* 남은 시간 */}
          <div className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-750 hover:shadow-lg hover:shadow-purple-900/20 transition-all">
            <p className="text-gray-400 text-sm font-medium mb-1">남은 시간</p>
            <p className="text-3xl font-semibold font-mono text-indigo-400">{remaining}</p>
          </div>
        </div>
      </div>
    </div>
  );
}