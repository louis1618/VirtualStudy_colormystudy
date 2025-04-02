"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { io, Socket } from 'socket.io-client';

type UseSocketProps = {
  username: string;
};

export default function useSocket({ username }: UseSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 소켓 연결 초기화
    const socketInitializer = async () => {
      try {
        // 소켓 서버 초기화 API 호출
        await fetch('/api/socket');
        
        // 소켓 클라이언트 생성
        const socketClient = io();
        setSocket(socketClient);
        
        // 연결 이벤트 리스너
        socketClient.on('connect', () => {
          console.log('소켓 연결됨');
          setIsConnected(true);
          
          // 사용자 방에 입장
          socketClient.emit('join-room', username);
        });
        
        // 연결 해제 이벤트 리스너
        socketClient.on('disconnect', () => {
          console.log('소켓 연결 해제됨');
          setIsConnected(false);
        });
      } catch (error) {
        console.error('소켓 연결 오류:', error);
      }
      
      // 컴포넌트 언마운트 시 소켓 연결 해제
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    };
    
    if (username) {
      socketInitializer();
    }
  }, [username]);
  
  // 방 설정 업데이트 함수
  const updateRoomSettings = (settings: any) => {
    if (socket && isConnected) {
      socket.emit('update-room-settings', username, settings);
    }
  };
  
  // 목표 업데이트 함수
  const updateGoals = (goals: any) => {
    if (socket && isConnected) {
      socket.emit('update-goals', username, goals);
    }
  };
  
  // 공부 시간 업데이트 함수
  const updateStudyTime = (studyTime: number) => {
    if (socket && isConnected) {
      socket.emit('update-study-time', username, studyTime);
    }
  };
  
  return {
    socket,
    isConnected,
    updateRoomSettings,
    updateGoals,
    updateStudyTime,
  };
}
