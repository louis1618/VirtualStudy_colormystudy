"use client";

import { useState, useEffect } from 'react';
import { FiClock, FiVolume2, FiVolumeX, FiX, FiTrash2 } from 'react-icons/fi';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (focusTask: string, minutes: number, playSound: boolean) => void;
  defaultTask?: string;
  defaultMinutes?: number;
  remainingTime?: string;
  studiedTime?: string;
  hasActiveSession?: boolean;
};

const STORAGE_KEYS = {
  FOCUS_TASK: 'study_timer_focus_task',
  MINUTES: 'study_timer_minutes',
  PLAY_SOUND: 'study_timer_play_sound',
  RECENT_TASKS: 'study_timer_recent_tasks',
  SESSION_STATE: 'study_timer_session_state'
};

export default function WelcomeModal({
  isOpen,
  onClose,
  onConfirm,
  defaultTask = '',
  defaultMinutes = 60,
  remainingTime = '00:00:00',
  studiedTime = '00:00:00',
  hasActiveSession = false
}: WelcomeModalProps) {
  const [focusTask, setFocusTask] = useState(defaultTask);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [playSound, setPlaySound] = useState(true);
  const [recentTasks, setRecentTasks] = useState<string[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTask = localStorage.getItem(STORAGE_KEYS.FOCUS_TASK);
      if (savedTask) {
        setFocusTask(savedTask);
      }
      
      const savedMinutes = localStorage.getItem(STORAGE_KEYS.MINUTES);
      if (savedMinutes) {
        setMinutes(Number(savedMinutes));
      }
      
      const savedPlaySound = localStorage.getItem(STORAGE_KEYS.PLAY_SOUND);
      if (savedPlaySound !== null) {
        setPlaySound(savedPlaySound === 'true');
      }
      
      const savedRecentTasks = localStorage.getItem(STORAGE_KEYS.RECENT_TASKS);
      if (savedRecentTasks) {
        try {
          const parsedTasks = JSON.parse(savedRecentTasks);
          if (Array.isArray(parsedTasks)) {
            setRecentTasks(parsedTasks);
          }
        } catch (error) {
          console.error('Failed to parse recent tasks:', error);
        }
      }
    }
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      if (defaultTask) {
        setFocusTask(defaultTask);
      } else {
        const savedTask = localStorage.getItem(STORAGE_KEYS.FOCUS_TASK);
        if (savedTask) {
          setFocusTask(savedTask);
        }
      }
      
      if (defaultMinutes !== 60) {
        setMinutes(defaultMinutes);
      } else {
        const savedMinutes = localStorage.getItem(STORAGE_KEYS.MINUTES);
        if (savedMinutes) {
          setMinutes(Number(savedMinutes));
        }
      }
      
      const savedPlaySound = localStorage.getItem(STORAGE_KEYS.PLAY_SOUND);
      if (savedPlaySound !== null) {
        setPlaySound(savedPlaySound === 'true');
      } else {
        setPlaySound(true);
      }
    }
  }, [isOpen, defaultTask, defaultMinutes]);
  
  const handleConfirm = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FOCUS_TASK, focusTask);
      localStorage.setItem(STORAGE_KEYS.MINUTES, String(minutes));
      localStorage.setItem(STORAGE_KEYS.PLAY_SOUND, String(playSound));
      
      if (focusTask.trim() && !recentTasks.includes(focusTask)) {
        const updatedTasks = [focusTask, ...recentTasks.slice(0, 4)];
        setRecentTasks(updatedTasks);
        localStorage.setItem(STORAGE_KEYS.RECENT_TASKS, JSON.stringify(updatedTasks));
      }
    }
    
    onConfirm(focusTask, minutes, playSound);
    onClose();
  };
  
  const handleSelectRecentTask = (task: string) => {
    setFocusTask(task);
  };
  
  const handleDeleteRecentTask = (taskToDelete: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const updatedTasks = recentTasks.filter(task => task !== taskToDelete);
    setRecentTasks(updatedTasks);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RECENT_TASKS, JSON.stringify(updatedTasks));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/95">
      <div className="relative max-w-md w-full bg-black border border-gray-800 rounded-lg shadow-xl">
        
        <div className="px-6 pb-6">
          <h2 className="flex justify-center pt-4 text-center text-2xl font-bold text-white mb-8">✏️</h2>
          
          {hasActiveSession && (
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-2">현재 세션 정보</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">공부한 시간</p>
                  <p className="text-white font-mono">{studiedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">남은 시간</p>
                  <p className="text-white font-mono">{remainingTime}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="focus-task" className="block text-sm font-medium text-gray-400 mb-2">
              무엇에 집중하실 건가요?
            </label>
            <input
              id="focus-task"
              type="text"
              value={focusTask}
              onChange={(e) => setFocusTask(e.target.value)}
              placeholder="예: 수학 문제 풀기"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all"
            />
            
            {recentTasks.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">최근 작업</p>
                <div className="flex flex-wrap gap-2">
                  {recentTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-800 text-gray-200 rounded-md overflow-hidden"
                    >
                      <button
                        onClick={() => handleSelectRecentTask(task)}
                        className="text-sm px-3 py-1 hover:bg-gray-700 transition-colors"
                      >
                        {task}
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecentTask(task, e)}
                        className="px-3.5 hover:bg-red-600/20 text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${task}`}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          
          <div className="mb-6">
            <label htmlFor="focus-time" className="block text-sm font-medium text-gray-400 mb-2">
              얼마나 집중하실 건가요?
            </label>
            <div className="relative">
              <select
                id="focus-time"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full appearance-none px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all pr-10"
              >
                {[15, 25, 30, 45, 60, 90, 120, 150, 180].map((min) => (
                  <option key={min} value={min}>
                    {min}분
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FiClock size={18} />
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <button
              onClick={() => setPlaySound(!playSound)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-all"
            >
              <span className="text-sm font-medium">타이머 종료 알림음</span>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-400">{playSound ? '켜짐' : '꺼짐'}</span>
                {playSound ? (
                  <FiVolume2 size={18} className="text-white" />
                ) : (
                  <FiVolumeX size={18} className="text-gray-500" />
                )}
              </div>
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-4 bg-gray-800 text-white hover:bg-gray-700 rounded-lg font-medium text-center transition-all"
            >
              닫기
            </button>
            <button
              onClick={handleConfirm}
              disabled={!focusTask.trim()}
              className={`flex-1 py-4 px-4 rounded-lg font-medium text-center transition-all ${
                focusTask.trim() 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}