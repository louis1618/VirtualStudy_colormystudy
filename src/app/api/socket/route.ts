import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('소켓 서버 초기화...');
    
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('클라이언트 연결됨:', socket.id);
      
      // 방 입장
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`사용자 ${socket.id}가 방 ${roomId}에 입장했습니다.`);
      });
      
      // 방 설정 업데이트
      socket.on('update-room-settings', (roomId, settings) => {
        socket.to(roomId).emit('room-settings-updated', settings);
        console.log(`방 ${roomId}의 설정이 업데이트되었습니다:`, settings);
      });
      
      // 목표 업데이트
      socket.on('update-goals', (roomId, goals) => {
        socket.to(roomId).emit('goals-updated', goals);
        console.log(`방 ${roomId}의 목표가 업데이트되었습니다.`);
      });
      
      // 공부 시간 업데이트
      socket.on('update-study-time', (roomId, studyTime) => {
        socket.to(roomId).emit('study-time-updated', studyTime);
        console.log(`방 ${roomId}의 공부 시간이 업데이트되었습니다:`, studyTime);
      });
      
      // 연결 해제
      socket.on('disconnect', () => {
        console.log('클라이언트 연결 해제:', socket.id);
      });
    });
  }
  
  res.end();
}
