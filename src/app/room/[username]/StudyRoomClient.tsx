"use client";

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import GoalTracker from '@/components/goals/GoalTracker';
import StudyTimeTracker from '@/components/goals/StudyTimeTracker';
import Timer from '@/components/timer/Timer';
import MusicPlayer from '@/components/music/MusicPlayer';
import RoomControls from '@/components/3d/RoomControls';
import RoomThemeCustomizer from '@/components/ui/RoomThemeCustomizer';
import RoomSharing from '@/components/ui/RoomSharing';
import useSocket from '@/hooks/useSocket';

// 클라이언트 사이드에서만 렌더링되도록 동적 임포트
const StudyRoom = dynamic(() => import('@/components/3d/StudyRoom'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-200px)] bg-gray-800 flex items-center justify-center">
      <p className="text-white text-xl">3D 스터디룸 로딩 중...</p>
    </div>
  ),
});

type RoomTheme = 'default' | 'cozy' | 'modern' | 'nature' | 'dark';

// 클라이언트 컴포넌트
export default function StudyRoomClient({ username }: { username: string }) {
  const { data: session } = useSession();
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [weatherType, setWeatherType] = useState<'clear' | 'rainy' | 'snowy'>('clear');
  const [hasFireplace, setHasFireplace] = useState(true);
  const [studyTime, setStudyTime] = useState(0);
  const [roomTheme, setRoomTheme] = useState<RoomTheme>('default');
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // 소켓 연결 설정
  const { isConnected, updateRoomSettings, updateStudyTime } = useSocket({ username });
  
  // 타이머에서 시간 업데이트 처리
  const handleTimeUpdate = (seconds: number) => {
    setStudyTime(prev => prev + seconds);
    updateStudyTime(seconds);
  };
  
  // 방 테마 변경 처리
  const handleThemeChange = (theme: RoomTheme) => {
    setRoomTheme(theme);
    updateRoomSettings({ theme });
  };
  
  const isOwnRoom = session?.user?.name === username;

  // Add custom CSS to ensure proper styling
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      .study-room-container {
        width: 100%;
        height: calc(100vh - 200px);
        min-height: 400px;
        position: relative;
        background-color: #1a1a1a;
      }
      
      @media (max-width: 768px) {
        .study-room-container {
          height: calc(100vh - 150px);
          min-height: 300px;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      {/* 3D 스터디룸 영역 */}
      <div className="flex-grow relative">
        <StudyRoom 
          timeOfDay={timeOfDay}
          weatherType={weatherType}
          hasFireplace={hasFireplace}
          theme={roomTheme}
        />
        
        {/* 컨트롤 패널 */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-lg shadow-lg">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white">{username}의 스터디룸</h2>
              {isConnected && <span className="text-xs text-green-600 dark:text-green-400 ml-2">실시간 연결됨</span>}
            </div>
            
            {isOwnRoom && (
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {showCustomizer ? '커스터마이징 닫기' : '방 커스터마이징'}
              </button>
            )}
          </div>
          
          <RoomControls 
            timeOfDay={timeOfDay}
            weatherType={weatherType}
            hasFireplace={hasFireplace}
            onTimeChange={(time) => {
              setTimeOfDay(time);
              updateRoomSettings({ timeOfDay: time });
            }}
            onWeatherChange={(weather) => {
              setWeatherType(weather);
              updateRoomSettings({ weatherType: weather });
            }}
            onFireplaceToggle={() => {
              const newValue = !hasFireplace;
              setHasFireplace(newValue);
              updateRoomSettings({ hasFireplace: newValue });
            }}
          />
        </div>
      </div>
      
      {/* 기능 영역 */}
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-800 shadow-inner">
        {showCustomizer && isOwnRoom && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
            <RoomThemeCustomizer 
              userId={username} 
              onThemeChange={handleThemeChange} 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 왼쪽 영역: 목표 및 시간 추적 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <GoalTracker userId={username} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <StudyTimeTracker userId={username} />
            </div>
            {isOwnRoom && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <RoomSharing username={username} />
              </div>
            )}
          </div>
          
          {/* 오른쪽 영역: 타이머 및 음악 플레이어 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <Timer onTimeUpdate={handleTimeUpdate} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <MusicPlayer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}