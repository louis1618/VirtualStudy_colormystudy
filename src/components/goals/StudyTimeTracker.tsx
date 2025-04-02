"use client";

import { useState, useEffect } from 'react';
import { FiClock, FiBarChart2 } from 'react-icons/fi';

type StudyTimeTrackerProps = {
  userId: string;
};

export default function StudyTimeTracker({ userId }: StudyTimeTrackerProps) {
  const [totalStudyTime, setTotalStudyTime] = useState(0); // 초 단위
  const [weeklyStudyTime, setWeeklyStudyTime] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]); // 일주일간 공부 시간 (초 단위)
  const [weeklyGoal, setWeeklyGoal] = useState(10 * 60 * 60); // 기본 목표: 10시간
  
  // 공부 시간 불러오기
  useEffect(() => {
    const savedTotalTime = localStorage.getItem(`${userId}_total_study_time`);
    const savedWeeklyTime = localStorage.getItem(`${userId}_weekly_study_time`);
    const savedWeeklyGoal = localStorage.getItem(`${userId}_weekly_goal`);
    
    if (savedTotalTime) {
      setTotalStudyTime(parseInt(savedTotalTime));
    }
    
    if (savedWeeklyTime) {
      setWeeklyStudyTime(JSON.parse(savedWeeklyTime));
    } else {
      // 기본값 설정
      const defaultWeeklyTime = [0, 0, 0, 0, 0, 0, 0];
      setWeeklyStudyTime(defaultWeeklyTime);
      localStorage.setItem(`${userId}_weekly_study_time`, JSON.stringify(defaultWeeklyTime));
    }
    
    if (savedWeeklyGoal) {
      setWeeklyGoal(parseInt(savedWeeklyGoal));
    } else {
      localStorage.setItem(`${userId}_weekly_goal`, weeklyGoal.toString());
    }
  }, [userId]);
  
  // 주간 목표 변경
  const handleWeeklyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value);
    const seconds = hours * 60 * 60;
    setWeeklyGoal(seconds);
    localStorage.setItem(`${userId}_weekly_goal`, seconds.toString());
  };
  
  // 시간 포맷 (초 -> HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}시간 ${minutes}분 ${secs}초`;
  };
  
  // 시간 포맷 (초 -> HH:MM)
  const formatHoursMinutes = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}시간 ${minutes}분`;
  };
  
  // 주간 총 공부 시간
  const weeklyTotal = weeklyStudyTime.reduce((acc, curr) => acc + curr, 0);
  
  // 주간 목표 달성률
  const weeklyProgress = Math.min(Math.round((weeklyTotal / weeklyGoal) * 100), 100);
  
  // 요일 이름
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 현재 요일
  const currentDay = new Date().getDay();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          <FiClock className="inline-block mr-2" />
          공부 시간 추적
        </h3>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">총 공부 시간</span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{formatHoursMinutes(totalStudyTime)}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">주간 목표</span>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="100"
              value={Math.floor(weeklyGoal / 3600)}
              onChange={handleWeeklyGoalChange}
              className="w-16 p-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right"
            />
            <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">시간</span>
          </div>
        </div>
        
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">주간 공부 시간</span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{formatHoursMinutes(weeklyTotal)}</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>
        
        <div className="text-right text-sm text-gray-700 dark:text-gray-300">
          {weeklyProgress}% 달성
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FiBarChart2 className="inline-block mr-1" />
          일별 공부 시간
        </h4>
        
        <div className="flex justify-between h-32">
          {weeklyStudyTime.map((time, index) => {
            const hours = time / 3600;
            const maxHeight = 100; // 최대 높이 (px)
            const maxHours = Math.max(10, ...weeklyStudyTime.map(t => t / 3600)); // 최대 시간 (최소 10시간)
            const height = (hours / maxHours) * maxHeight;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="flex-grow flex items-end">
                  <div
                    className={`w-8 ${
                      index === currentDay
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-blue-200 dark:bg-blue-800'
                    } rounded-t-sm`}
                    style={{ height: `${height}px` }}
                  ></div>
                </div>
                <div className={`text-xs mt-1 ${
                  index === currentDay
                    ? 'font-bold text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {dayNames[index]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(time / 3600)}h
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
