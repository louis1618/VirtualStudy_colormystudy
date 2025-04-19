"use client";

import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import YouTube from 'react-youtube';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  type: 'youtube' | 'local';
  duration: number;
}

interface MusicPlayerProps {
  isVisible: boolean;
}

export default function MusicPlayer({ isVisible }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [player, setPlayer] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTracks = localStorage.getItem('musicPlayerTracks');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    if (tracks.length > 0) {
      localStorage.setItem('musicPlayerTracks', JSON.stringify(tracks));
    }
  }, [tracks]);

  useEffect(() => {
    if (tracks.length > 0 && tracks[currentTrack]?.type === 'local') {
      if (!audioRef.current) {
        audioRef.current = new Audio(tracks[currentTrack].src);
        audioRef.current.addEventListener('ended', handleNext);
      } else {
        audioRef.current.src = tracks[currentTrack].src;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleNext);
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentTrack, tracks]);

  useEffect(() => {
    if (tracks.length === 0 || tracks[currentTrack]?.type !== 'local') return;
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
        
        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            const currentProgress = (time / duration) * 100;
            setProgress(isNaN(currentProgress) ? 0 : currentProgress);
            setCurrentTime(time);
          }
        }, 1000);
      } else {
        audioRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack, tracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (tracks.length === 0) return;
    
    if (tracks[currentTrack].type === 'youtube' && player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    const newTrack = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    changeTrack(newTrack);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const newTrack = (currentTrack + 1) % tracks.length;
    changeTrack(newTrack);
  };

  const changeTrack = (trackIndex: number) => {
    if (tracks[currentTrack]?.type === 'local' && audioRef.current) {
      audioRef.current.pause();
    } else if (tracks[currentTrack]?.type === 'youtube' && player) {
      player.stopVideo();
    }
    
    setCurrentTrack(trackIndex);
    setProgress(0);
    setCurrentTime(0);
    
    if (tracks[trackIndex]?.type === 'local' && audioRef.current) {
      audioRef.current.src = tracks[trackIndex].src;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tracks.length === 0) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.clientWidth;
    const percentage = (clickPosition / progressBarWidth) * 100;
    
    if (tracks[currentTrack].type === 'local' && audioRef.current) {
      audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
    } else if (tracks[currentTrack].type === 'youtube' && player) {
      const newTime = (percentage / 100) * tracks[currentTrack].duration;
      player.seekTo(newTime);
    }
    
    setProgress(percentage);
  };

  const toggleMute = () => {
    if (tracks[currentTrack]?.type === 'local' && audioRef.current) {
      audioRef.current.muted = !isMuted;
    } else if (tracks[currentTrack]?.type === 'youtube' && player) {
      isMuted ? player.unMute() : player.mute();
    }
    setIsMuted(!isMuted);
  };

  const onReady = (event: any) => {
    setPlayer(event.target);
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onStateChange = (event: any) => {
    if (event.data === 1) {
      setIsPlaying(true);
      
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        if (player) {
          const time = player.getCurrentTime();
          const duration = tracks[currentTrack].duration;
          const currentProgress = (time / duration) * 100;
          setProgress(currentProgress);
          setCurrentTime(time);
        }
      }, 1000);
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } else if (event.data === 0) {
      handleNext();
    }
  };

  const getYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addYoutubeTrack = async () => {
    try {
      const videoId = getYoutubeId(youtubeUrl);
      if (!videoId) {
        alert('유효한 YouTube URL이 아닙니다.');
        return;
      }

      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      
      let duration = 300;
      
      try {
        const tempPlayer = new YT.Player('temp-player', {
          videoId: videoId,
          events: {
            onReady: (event) => {
              duration = event.target.getDuration();
              
              const newTrack: Track = {
                id: Date.now().toString(),
                title: data.title,
                artist: data.author_name,
                src: videoId,
                type: 'youtube',
                duration: duration
              };
              
              setTracks(prev => [...prev, newTrack]);
              setYoutubeUrl('');
              setShowAddForm(false);
              
              if (tracks.length === 0) {
                setCurrentTrack(0);
              }
              
              tempPlayer.destroy();
            }
          }
        });
        
        return;
      } catch (error) {
        console.error('YouTube 동영상 길이를 가져오는 데 실패했습니다:', error);
      }
      
      const newTrack: Track = {
        id: Date.now().toString(),
        title: data.title,
        artist: data.author_name,
        src: videoId,
        type: 'youtube',
        duration: duration
      };
      
      setTracks([...tracks, newTrack]);
      setYoutubeUrl('');
      setShowAddForm(false);
      
      if (tracks.length === 0) {
        setCurrentTrack(0);
      }
      
    } catch (error) {
      console.error('YouTube 비디오 정보를 가져오는 데 실패했습니다:', error);
      alert('YouTube 비디오 정보를 가져오는 데 실패했습니다.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileURL = URL.createObjectURL(file);
    
    const audio = new Audio(fileURL);
    audio.addEventListener('loadedmetadata', () => {
      const newTrack: Track = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: '로컬 파일',
        src: fileURL,
        type: 'local',
        duration: audio.duration
      };
      
      setTracks([...tracks, newTrack]);
      
      if (tracks.length === 0) {
        setCurrentTrack(0);
      }
    });
  };

  const removeTrack = (id: string, index: number) => {
    const newTracks = tracks.filter(track => track.id !== id);
    setTracks(newTracks);
    
    if (index === currentTrack) {
      if (newTracks.length > 0) {
        const newIndex = index >= newTracks.length ? newTracks.length - 1 : index;
        setCurrentTrack(newIndex);
      } else {
        setIsPlaying(false);
      }
    } else if (index < currentTrack) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div 
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 w-96">
        {tracks.length > 0 ? (
          <div className="mb-4">
            {tracks[currentTrack]?.type === 'youtube' && (
              <div className="hidden">
                <YouTube
                  videoId={tracks[currentTrack]?.src}
                  opts={{ playerVars: { autoplay: isPlaying ? 1 : 0 } }}
                  onReady={onReady}
                  onStateChange={onStateChange}
                />
              </div>
            )}
            <h3 className="text-white text-base font-semibold truncate">{tracks[currentTrack]?.title || '트랙 없음'}</h3>
            <p className="text-gray-300 text-sm truncate">{tracks[currentTrack]?.artist || ''}</p>
            
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(tracks[currentTrack]?.duration || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-center py-3">
            <p className="text-gray-300 text-sm">재생 목록에 트랙을 추가해주세요</p>
          </div>
        )}
        
        <div className="h-2 bg-gray-700 rounded-full mb-5 cursor-pointer" onClick={handleProgressClick}>
          <div 
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={toggleMute}
            className="text-gray-300 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700"
          >
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
          
          <div className="flex items-center space-x-5">
            <button 
              onClick={handlePrevious}
              className="text-gray-300 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700"
              disabled={tracks.length === 0}
            >
              <FiSkipBack size={20} />
            </button>
            
            <button 
              onClick={handlePlayPause}
              className={`${tracks.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'} text-white p-3.5 rounded-full transition`}
              disabled={tracks.length === 0}
            >
              {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} className="ml-0.5" />}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-gray-300 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700"
              disabled={tracks.length === 0}
            >
              <FiSkipForward size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-gray-300 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700"
          >
            <FiPlus size={20} />
          </button>
        </div>
        
        <div id="temp-player" style={{ display: 'none' }}></div>
        
        {showAddForm && (
          <div className="mt-5 border-t border-gray-700 pt-4">
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1.5 block font-medium">YouTube URL</label>
              <div className="flex">
                <input 
                  type="text" 
                  value={youtubeUrl} 
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="YouTube URL 입력" 
                  className="bg-gray-700 text-white text-sm p-2.5 rounded-l flex-1 outline-none border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  onClick={addYoutubeTrack}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-r font-medium transition"
                >
                  추가
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="text-gray-300 text-sm mb-1.5 block font-medium">로컬 파일 업로드</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm p-2.5 rounded flex items-center justify-center gap-2 border border-gray-600 transition"
              >
                <FiUpload size={18} /> 음악 파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
        
        {tracks.length > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-3 max-h-60 overflow-y-auto">
            <h4 className="text-gray-300 text-xs mb-2">재생 목록</h4>
            <ul className="space-y-1">
              {tracks.map((track, index) => (
                <li 
                  key={track.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${
                    index === currentTrack ? 'bg-indigo-600/30 text-white' : 'hover:bg-gray-800 text-gray-300'
                  }`}
                  onClick={() => changeTrack(index)}
                >
                  <div className="flex-1 mr-2 truncate">
                    <p className="truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">{formatTime(track.duration)}</span>
                    <button 
                      className="text-gray-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        removeTrack(track.id, index);
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}