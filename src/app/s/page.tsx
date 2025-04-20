"use client";

import { useState, useEffect, useRef } from 'react';
import WelcomeModal from '@/components/studytimer-ver2/WelcomeModal';
import KoreanTimeDisplay from '@/components/studytimer-ver2/KoreanTimeDisplay';
import StudyDuration from '@/components/studytimer-ver2/StudyDuration';
import AlertModal from '@/components/studytimer-ver2/AlertModal';
import BreakTimer from '@/components/studytimer-ver2/BreakTimer';
import BreakEndModal from '@/components/studytimer-ver2/BreakEndModal';
import MusicPlayer from '@/components/studytimer-ver2/MusicPlayer';
import YouTubeApiLoader from '@/components/studytimer-ver2/YouTubeApiLoader';
import { playNotificationSound } from '@/utils/notification';

const STORAGE_KEYS = {
  SESSION_STATE: 'study_timer_session_state',
  FOCUS_TASK: 'study_timer_focus_task',
  MINUTES: 'study_timer_minutes',
  PLAY_SOUND: 'study_timer_play_sound',
  START_TIME: 'study_timer_start_time',
  IS_BREAK_ACTIVE: 'study_timer_is_break_active',
  BREAK_MINUTES: 'study_timer_break_minutes',
  BREAK_START_TIME: 'study_timer_break_start_time',
  BREAK_REMAINING_SECONDS: 'study_timer_break_remaining_seconds',
  ACCUMULATED_STUDY_TIME: 'study_timer_accumulated_study_time'
};

export default function StudyTimerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [focusTask, setFocusTask] = useState('');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [playSound, setPlaySound] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  
  const [studiedTime, setStudiedTime] = useState('00:00:00');
  const [remainingTime, setRemainingTime] = useState('00:00:00');
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const musicPlayerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const musicPlayerRef = useRef<HTMLDivElement>(null);
  const musicToggleButtonRef = useRef<HTMLButtonElement>(null);
  
  const [showBreakEndModal, setShowBreakEndModal] = useState(false);
  const [accumulatedStudyTimeMs, setAccumulatedStudyTimeMs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsLoading(true);
        
        const savedSessionState = localStorage.getItem(STORAGE_KEYS.SESSION_STATE);
        
        if (savedSessionState) {
          const sessionState = JSON.parse(savedSessionState);
          
          const task = sessionState.focusTask || '';
          const minutes = sessionState.focusMinutes || 25;
          const sound = sessionState.playSound !== undefined ? sessionState.playSound : true;
          
          setFocusTask(task);
          setFocusMinutes(minutes);
          setPlaySound(sound);
          
          if (sessionState.startTime) {
            const parsedStartTime = new Date(sessionState.startTime);
            setStartTime(parsedStartTime);
            setShowWelcomeModal(false);
            setIsActive(true);
          }
          
          setIsBreakActive(sessionState.isBreakActive || false);
          setBreakMinutes(sessionState.breakMinutes || 5);
          
          if (sessionState.breakStartTime) {
            setBreakStartTime(new Date(sessionState.breakStartTime));
          }
          
          if (sessionState.breakRemainingSeconds !== undefined) {
            setBreakRemainingSeconds(sessionState.breakRemainingSeconds);
          }
          
          setShowAlertModal(sessionState.showAlertModal || false);
          setIsTimeUp(sessionState.isTimeUp || false);
          
          if (sessionState.accumulatedStudyTimeMs !== undefined) {
            setAccumulatedStudyTimeMs(sessionState.accumulatedStudyTimeMs);
          }
          
          setIsPaused(sessionState.isPaused || false);
          if (sessionState.pauseStartTime) {
            setPauseStartTime(new Date(sessionState.pauseStartTime));
          }
        } else {
          const savedBreakMinutes = localStorage.getItem(STORAGE_KEYS.BREAK_MINUTES);
          if (savedBreakMinutes) {
            setBreakMinutes(Number(savedBreakMinutes));
          }
          
          const savedBreakRemainingSeconds = localStorage.getItem(STORAGE_KEYS.BREAK_REMAINING_SECONDS);
          if (savedBreakRemainingSeconds) {
            setBreakRemainingSeconds(Number(savedBreakRemainingSeconds));
          }
          
          const savedAccumulatedTime = localStorage.getItem(STORAGE_KEYS.ACCUMULATED_STUDY_TIME);
          if (savedAccumulatedTime) {
            setAccumulatedStudyTimeMs(Number(savedAccumulatedTime));
          }
        }
      } catch (error) {
        console.error('Failed to restore session state:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isMouseActive) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isMouseActive]);

  useEffect(() => {
    if (typeof window !== 'undefined' && startTime) {
      const sessionState = {
        focusTask,
        focusMinutes,
        startTime: startTime ? startTime.toISOString() : null,
        accumulatedStudyTimeMs,
        isActive,
        isPaused,
        pauseStartTime: pauseStartTime ? pauseStartTime.toISOString() : null,
        isBreakActive,
        breakMinutes,
        breakStartTime: breakStartTime ? breakStartTime.toISOString() : null,
        breakRemainingSeconds,
        showAlertModal,
        isTimeUp,
        playSound
      };
      
      localStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(sessionState));
    }
  }, [
    focusTask, focusMinutes, startTime, accumulatedStudyTimeMs, 
    isActive, isPaused, pauseStartTime, isBreakActive, 
    breakMinutes, breakStartTime, breakRemainingSeconds,
    showAlertModal, isTimeUp, playSound
  ]);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseMove);
    window.addEventListener('keydown', handleMouseMove);
    window.addEventListener('scroll', handleMouseMove);
    
    handleMouseMove();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseMove);
      window.removeEventListener('keydown', handleMouseMove);
      window.removeEventListener('scroll', handleMouseMove);
      
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!startTime || isTimeUp || isBreakActive) return;
    
    const checkTimeUp = () => {
      const now = new Date();
      const endTime = new Date(startTime.getTime() + focusMinutes * 60 * 1000);
      
      if (now >= endTime && !isTimeUp) {
        const studySessionMs = now.getTime() - startTime.getTime();
        setAccumulatedStudyTimeMs(prev => prev + studySessionMs);
        
        setIsTimeUp(true);
        if (playSound) {
          playNotificationSound();
        }
        setShowAlertModal(true);
      }
      
      const elapsedMs = now.getTime() - startTime.getTime();
      const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
      
      const totalStudyTimeMs = accumulatedStudyTimeMs + elapsedMs;
      const totalHours = Math.floor(totalStudyTimeMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor((totalStudyTimeMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalSeconds = Math.floor((totalStudyTimeMs % (1000 * 60)) / 1000);
      
      setStudiedTime(
        `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`
      );
      
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setRemainingTime(
        `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      );
    };
    
    checkTimeUp();
    
    timeCheckRef.current = setInterval(checkTimeUp, 1000);
    
    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    };
  }, [startTime, focusMinutes, isTimeUp, isBreakActive, playSound, accumulatedStudyTimeMs]);

  useEffect(() => {
    if (!isMouseActive && showMusicPlayer) {
      musicPlayerTimerRef.current = setTimeout(() => {
        setShowMusicPlayer(false);
      }, 0);
    }
  
    return () => {
      if (musicPlayerTimerRef.current) {
        clearTimeout(musicPlayerTimerRef.current);
      }
    };
  }, [isMouseActive, showMusicPlayer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMusicPlayer && 
        musicPlayerRef.current && 
        !musicPlayerRef.current.contains(event.target as Node) &&
        musicToggleButtonRef.current &&
        !musicToggleButtonRef.current.contains(event.target as Node)
      ) {
        setShowMusicPlayer(false);
      }
    };

    if (showMusicPlayer) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMusicPlayer]);

  const handleWelcomeConfirm = (task: string, minutes: number, sound: boolean) => {
    setFocusTask(task);
    setFocusMinutes(minutes);
    setPlaySound(sound);
    setStartTime(new Date());
    setShowWelcomeModal(false);
    setIsTimeUp(false);
  };

  const handleRestart = () => {
    if (startTime) {
      const now = new Date();
      const studySessionMs = now.getTime() - startTime.getTime();
      setAccumulatedStudyTimeMs(prev => prev + studySessionMs);
    }
    
    setShowWelcomeModal(true);
    setIsBreakActive(false);
  };
  
  const handleExtendTime = (minutes: number, resetStartTime = false) => {
    const now = new Date();
    
    setFocusMinutes(prev => prev + minutes);
    
    setIsTimeUp(false);
    setShowAlertModal(false);
    
    if (typeof window !== 'undefined' && startTime) {
      const sessionState = {
        startTime: startTime.toISOString(),
        focusMinutes: focusMinutes + minutes,
        focusTask,
        accumulatedStudyTimeMs
      };
      localStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(sessionState));
    }
  };
  
  const handleTakeBreak = (minutes: number) => {
    const now = new Date();
    
    setBreakMinutes(minutes);
    setIsBreakActive(true);
    setBreakStartTime(new Date());
    setBreakRemainingSeconds(minutes * 60);
    setShowAlertModal(false);
    
    if (typeof window !== 'undefined' && startTime) {
      const sessionState = {
        startTime: startTime.toISOString(),
        focusMinutes,
        focusTask,
        accumulatedStudyTimeMs,
        isBreakActive: true,
        breakStartTime: new Date().toISOString(),
        breakMinutes: minutes
      };
      localStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(sessionState));
    }
  };
  
  const handleFinish = () => {
    setShowAlertModal(false);
    setShowWelcomeModal(true);
    setIsTimeUp(false);
    setIsBreakActive(false);
    setStartTime(null);
    setBreakStartTime(null);
    setAccumulatedStudyTimeMs(0);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SESSION_STATE);
      localStorage.removeItem(STORAGE_KEYS.ACCUMULATED_STUDY_TIME);
    }
  };
  
  const handleBreakEnd = () => {
    setIsBreakActive(false);
    setBreakStartTime(null);
    setBreakRemainingSeconds(null);
    if (playSound) {
      playNotificationSound();
    }
    
    setShowBreakEndModal(true);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.BREAK_REMAINING_SECONDS);
    }
  };
  
  const handleContinueStudy = (minutes: number, addToExisting: boolean) => {
    const now = new Date();
    
    if (addToExisting) {
      setFocusMinutes(prev => prev + minutes);
    } else {
      setStartTime(now);
      setFocusMinutes(minutes);
      
      if (startTime) {
        const studiedMs = now.getTime() - startTime.getTime();
        setAccumulatedStudyTimeMs(prev => prev + studiedMs);
      }
    }
    
    setIsBreakActive(false);
    setBreakStartTime(null);
    setBreakRemainingSeconds(0);
    setShowBreakEndModal(false);
    
    setIsTimeUp(false);
    
    if (typeof window !== 'undefined') {
      const sessionState = {
        startTime: startTime ? startTime.toISOString() : now.toISOString(),
        focusMinutes: addToExisting ? focusMinutes + minutes : minutes,
        focusTask,
        accumulatedStudyTimeMs,
        isBreakActive: false
      };
      localStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(sessionState));
    }
  };
  
  const handleCancelContinue = () => {
    setShowBreakEndModal(false);
    setShowWelcomeModal(true);
  };
  
  const handleSkipBreak = () => {
    setIsBreakActive(false);
    setBreakStartTime(null);
    setBreakRemainingSeconds(null);
    setShowBreakEndModal(true);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.BREAK_REMAINING_SECONDS);
    }
  };

  const toggleMusicPlayer = () => {
    setShowMusicPlayer(prev => !prev);
  };

  const handleBreakRemainingSecondsChange = (seconds: number) => {
    setBreakRemainingSeconds(seconds);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BREAK_REMAINING_SECONDS, String(seconds));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BREAK_MINUTES, String(breakMinutes));
    }
  }, [breakMinutes]);

  return (
    <div 
      className={`flex min-h-screen flex-col items-center justify-center bg-black ${
        !isMouseActive ? 'cursor-none' : ''
      }`}
    >
      <YouTubeApiLoader />
      
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={() => setShowWelcomeModal(false)}
            onConfirm={handleWelcomeConfirm}
            defaultTask={focusTask}
            defaultMinutes={focusMinutes}
            remainingTime={remainingTime}
            studiedTime={studiedTime}
            hasActiveSession={!!startTime && !isTimeUp}
          />
          
          <AlertModal 
            isOpen={showAlertModal}
            onExtend={handleExtendTime}
            onBreak={handleTakeBreak}
            onFinish={handleFinish}
            defaultExtendMinutes={15}
            defaultBreakMinutes={breakMinutes}
          />
          
          <BreakEndModal
            isOpen={showBreakEndModal}
            onContinue={handleContinueStudy}
            onCancel={handleCancelContinue}
            defaultMinutes={focusMinutes}
          />
          
          <div 
            className={`text-center transition-all duration-700 ease-in-out ${
              !isMouseActive && startTime ? 'mt-16' : (startTime ? '-mt-16' : '')
            }`}
          >
            <KoreanTimeDisplay />
            
            {startTime && !isBreakActive && (
              <StudyDuration 
                startTime={startTime} 
                focusTask={focusTask}
                isVisible={isMouseActive}
                durationMinutes={focusMinutes}
              />
            )}
            
            {isBreakActive && (
              <BreakTimer 
                breakMinutes={breakMinutes}
                isActive={isBreakActive}
                onBreakEnd={handleBreakEnd}
                initialRemainingSeconds={breakRemainingSeconds !== null ? breakRemainingSeconds : undefined}
                onRemainingSecondsChange={handleBreakRemainingSecondsChange}
              />
            )}
          </div>
          
          {(startTime || isBreakActive) && (
            <div ref={musicPlayerRef}>
              <MusicPlayer isVisible={showMusicPlayer} />
            </div>
          )}
          
          {(startTime || isBreakActive) && (
            <div 
              className={`fixed bottom-8 transition-opacity duration-500 ${
                isMouseActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex gap-4">
                {isBreakActive && (
                  <button
                    onClick={handleSkipBreak}
                    className="px-6 py-3 bg-black border border-[#7bbfcf]/50 rounded-full text-[#7bbfcf] hover:bg-[#7bbfcf]/10 transition-all"
                  >
                    휴식 건너뛰기
                  </button>
                )}
                
                <button
                  ref={musicToggleButtonRef}
                  onClick={toggleMusicPlayer}
                  className="px-6 py-3 bg-black border border-indigo-500/50 rounded-full text-indigo-400 hover:bg-indigo-500/10 transition-all"
                >
                  음악 플레이어
                </button>
                
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-black border border-white/30 rounded-full text-white/80 hover:bg-white/10 transition-all"
                >
                  재설정
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}