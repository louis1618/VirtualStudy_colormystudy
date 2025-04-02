"use client";

import { useState, useEffect } from 'react';
import { Howl } from 'howler';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSkipForward, FiSkipBack } from 'react-icons/fi';

// 음악 트랙 목록
const TRACKS = [
  {
    id: 1,
    title: '집중을 위한 로파이',
    artist: 'Ambient',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 2,
    title: '잔잔한 피아노',
    artist: 'Piano',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1ecd.mp3?filename=relaxing-145038.mp3',
  },
  {
    id: 3,
    title: '자연 소리',
    artist: 'Nature',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_942d7cf170.mp3?filename=birds-nature-forest-ambient-sound-127411.mp3',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Howl | null>(null);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  
  // 현재 트랙
  const currentTrack = TRACKS[currentTrackIndex];
  
  // 사운드 초기화
  useEffect(() => {
    if (sound) {
      sound.stop();
    }
    
    const newSound = new Howl({
      src: [currentTrack.url],
      html5: true,
      volume: isMuted ? 0 : volume,
      onload: () => {
        setDuration(newSound.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        requestAnimationFrame(updateSeek);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onstop: () => {
        setIsPlaying(false);
        setSeek(0);
      },
      onend: () => {
        nextTrack();
      },
    });
    
    setSound(newSound);
    
    return () => {
      if (newSound) {
        newSound.stop();
      }
    };
  }, [currentTrackIndex]);
  
  // 재생 위치 업데이트
  const updateSeek = () => {
    if (sound && isPlaying) {
      setSeek(sound.seek());
      requestAnimationFrame(updateSeek);
    }
  };
  
  // 재생/일시정지 토글
  const togglePlay = () => {
    if (!sound) return;
    
    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
  };
  
  // 볼륨 조절
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (sound) {
      sound.volume(isMuted ? 0 : newVolume);
    }
  };
  
  // 음소거 토글
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (sound) {
      sound.volume(isMuted ? volume : 0);
    }
  };
  
  // 다음 트랙
  const nextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % TRACKS.length);
  };
  
  // 이전 트랙
  const prevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + TRACKS.length) % TRACKS.length);
  };
  
  // 재생 위치 변경
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeek = parseFloat(e.target.value);
    setSeek(newSeek);
    
    if (sound) {
      sound.seek(newSeek);
    }
  };
  
  // 시간 포맷 (초 -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">음악 플레이어</h3>
      
      <div className="mb-4">
        <div className="text-gray-900 dark:text-white font-medium">{currentTrack.title}</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">{currentTrack.artist}</div>
      </div>
      
      {/* 재생 진행 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{formatTime(seek)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={seek}
          onChange={handleSeekChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevTrack}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          aria-label="이전 트랙"
        >
          <FiSkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          aria-label="다음 트랙"
        >
          <FiSkipForward size={20} />
        </button>
      </div>
      
      {/* 볼륨 컨트롤 */}
      <div className="flex items-center">
        <button
          onClick={toggleMute}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mr-2"
          aria-label={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
