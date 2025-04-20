"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TodoList from '@/components/studytimer-ver1/TodoList';
import CottageTimer from '@/components/studytimer-ver1/CottageTimer';
import CottageControls from '@/components/studytimer-ver1/CottageControls';
import PetSelection from '@/components/studytimer-ver1/PetSelection';
import WelcomeModal from '@/components/studytimer-ver2/WelcomeModal';
import { IoMdSettings } from 'react-icons/io';
import MusicPlayer from '@/components/studytimer-ver1/MusicPlayer';
import { FaTimes } from 'react-icons/fa';

const StudyRoom = dynamic(() => import('@/components/studytimer-ver1/StudyRoom'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-xl text-center px-4">3D 코티지 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function VirtualCottageClient() {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('night');
  const [weatherType, setWeatherType] = useState<'clear' | 'rainy' | 'snowy'>('clear');
  const [hasFireplace, setHasFireplace] = useState(true);
  const [roomTheme, setRoomTheme] = useState<'default' | 'cozy' | 'modern' | 'nature' | 'dark'>('cozy');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [focusTask, setFocusTask] = useState('공부 시간');
  const [focusMinutes, setFocusMinutes] = useState(60);
  const [playSound, setPlaySound] = useState(true);
  const [timerAutoStart, setTimerAutoStart] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { theme, setTheme } = useTheme();

  const handleWelcomeConfirm = (task: string, minutes: number, sound: boolean) => {
    setFocusTask(task);
    setFocusMinutes(minutes);
    setPlaySound(sound);
    setTimerAutoStart(true);
    setShowWelcomeModal(false);
  };

  useEffect(() => {
    if (theme === 'dark') {
      setRoomTheme('dark');
    } else {
      setRoomTheme('cozy');
    }
  }, [theme]);

  const handleTimeChange = (time: 'day' | 'night') => {
    setTimeOfDay(time);
    if (time === 'night' && theme !== 'dark') {
      setTheme('dark');
    } else if (time === 'day' && theme !== 'light') {
      setTheme('light');
    }
  };

  const handleWeatherChange = (weather: 'clear' | 'rainy' | 'snowy') => {
    console.log("날씨 변경:", weather);
    setWeatherType(weather);
  };

  const toggleControlsModal = () => {
    setShowControlsModal(!showControlsModal);
  };

  useEffect(() => {
    if (isMobile) return;
    
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (!showSidebar && !showTodoList) {
          setShowUI(false);
        }
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [showSidebar, showTodoList, isMobile]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <StudyRoom
          timeOfDay={timeOfDay}
          weatherType={weatherType}
          hasFireplace={hasFireplace}
          theme={roomTheme}
        />
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onConfirm={handleWelcomeConfirm}
        defaultTask={focusTask}
        defaultMinutes={focusMinutes}
      />

      <div className={`transition-opacity duration-300`}>
        <div className="fixed top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
          <CottageTimer 
            timeFormat={timeFormat} 
            focusTask={focusTask}
            remainingMinutes={focusMinutes}
            playSound={playSound}
            autoStart={timerAutoStart}
          />
          
          <div className="flex items-center gap-2">
            
            <button
              onClick={toggleControlsModal}
              className={`w-10 h-10 sm:w-12 sm:h-12 ${showControlsModal ? 'bg-white/30' : 'bg-black/40'} hover:bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all shadow-lg`}
              aria-label="설정 메뉴"
            >
              <IoMdSettings size={isMobile ? 18 : 20} />
            </button>
          </div>
        </div>

        <div 
          className={`fixed top-20 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] bg-black/60 backdrop-blur-lg rounded-xl shadow-lg transition-transform duration-300 ease-in-out ${
            showTodoList ? 'transform-none' : 'translate-x-full'
          }`}
        >
          <TodoList />
          <MusicPlayer/>
        </div>

        <div className={`fixed bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md text-white px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-4 sm:gap-6 max-w-[95%] sm:max-w-none transition-all ${showUI ? 'opacity-100' : 'opacity-0'}`}>
          <PetSelection/>
        </div>
      </div>

      <CottageControls
        timeOfDay={timeOfDay}
        weatherType={weatherType}
        hasFireplace={hasFireplace}
        timeFormat={timeFormat}
        onTimeChange={handleTimeChange}
        onWeatherChange={handleWeatherChange}
        onFireplaceToggle={() => setHasFireplace(prev => !prev)}
        onTimeFormatChange={setTimeFormat}
        isOpen={showControlsModal}
        onClose={() => setShowControlsModal(false)}
        isMobile={isMobile}
      />
    </main>
  );
}
