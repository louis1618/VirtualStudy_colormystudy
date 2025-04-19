"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 초기 상태 설정
    setMatches(media.matches);
    
    // 변경 이벤트 리스너
    const listener = () => setMatches(media.matches);
    
    // 이벤트 리스너 등록
    media.addEventListener('change', listener);
    
    // 클린업 함수
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}