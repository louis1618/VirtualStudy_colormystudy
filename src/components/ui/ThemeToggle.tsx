"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // 컴포넌트가 마운트된 후에만 테마 전환 UI를 렌더링
  // 이는 서버 사이드 렌더링과 클라이언트 사이드 렌더링 간의 불일치를 방지
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <button
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  );
}
