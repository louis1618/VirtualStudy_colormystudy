"use client";

import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function RoomThemeCustomizer({ userId, onThemeChange }) {
  const [selectedTheme, setSelectedTheme] = useState('default');
  
  const themes = [
    { id: 'default', name: '기본', description: '편안한 기본 테마' },
    { id: 'cozy', name: '아늑함', description: '따뜻하고 아늑한 분위기' },
    { id: 'modern', name: '모던', description: '깔끔하고 현대적인 스타일' },
    { id: 'nature', name: '자연', description: '자연 친화적인 분위기' },
    { id: 'dark', name: '다크', description: '어두운 집중 모드' },
  ];
  
  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
    
    // 테마 설정 저장 (실제 구현에서는 API 호출)
    localStorage.setItem(`${userId}_theme`, themeId);
  };
  
  // 저장된 테마 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem(`${userId}_theme`);
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      onThemeChange(savedTheme);
    }
  }, [userId, onThemeChange]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">방 테마 설정</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`p-3 rounded-md text-center transition-colors ${
              selectedTheme === theme.id
                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">{theme.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
