// KoreanTimeDisplay.tsx
"use client";
import { useState, useEffect } from 'react';

export default function KoreanTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time in Korean style (오전/오후 HH:MM)
  const formatKoreanTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Determine AM/PM in Korean
    const ampm = hours < 12 ? '오전' : '오후';
    
    // Convert to 12-hour format
    const displayHours = hours % 12 || 12;
    
    // Format minutes with leading zero if needed
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${ampm} ${displayHours}:${displayMinutes}`;
  };
  
  return (
    <div className="select-none text-white text-7xl font-light tracking-tight transition-all duration-700">
      {formatKoreanTime(currentTime)}
    </div>
  );
}