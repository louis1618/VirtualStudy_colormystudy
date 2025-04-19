"use client";

import { useState, useEffect, useRef } from 'react';

type BreakTimerProps = {
  breakMinutes: number;
  isActive: boolean;
  onBreakEnd: () => void;
  initialRemainingSeconds?: number;
  onRemainingSecondsChange?: (seconds: number) => void;
};

export default function BreakTimer({ 
  breakMinutes, 
  isActive, 
  onBreakEnd,
  initialRemainingSeconds,
  onRemainingSecondsChange
}: BreakTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : breakMinutes * 60
  );
  
  const prevRemainingSecondsRef = useRef(remainingSeconds);
  
  useEffect(() => {
    if (!isActive) {
      setRemainingSeconds(breakMinutes * 60);
    }
  }, [isActive, breakMinutes]);
  
  useEffect(() => {
    if (!isActive) return;
    
    if (remainingSeconds <= 0) {
      onBreakEnd();
      return;
    }
    
    const timer = setInterval(() => {
      setRemainingSeconds(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isActive, remainingSeconds, onBreakEnd]);
  
  useEffect(() => {
    if (prevRemainingSecondsRef.current !== remainingSeconds && onRemainingSecondsChange) {
      onRemainingSecondsChange(remainingSeconds);
      prevRemainingSecondsRef.current = remainingSeconds;
    }
  }, [remainingSeconds, onRemainingSecondsChange]);
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (!isActive) return null;
  
  return (
    <div className="mt-6 max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      <div className="bg-gray-800 rounded-t-xl p-4 text-center">
        <p className="text-gray-400 text-sm font-medium mb-1">휴식 타이머</p>
        <p className="text-3xl font-semibold font-mono text-indigo-400">{formattedTime}</p>
      </div>
    </div>
  );
}
