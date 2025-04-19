"use client";

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { 
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiSkipForward, 
  FiSkipBack, FiList, FiX, FiPlus, FiMusic, FiHeart, FiTrash2,
  FiYoutube, FiSearch, FiMaximize, FiMinimize, FiVideo
} from 'react-icons/fi';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type TrackType = 'audio' | 'youtube';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  favorite: boolean;
  type: TrackType;
  videoId?: string;
  duration?: number;
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: 1,
    title: '집중을 위한 로파이',
    artist: 'Ambient',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    favorite: false,
    type: 'audio'
  },
  {
    id: 2,
    title: '잔잔한 피아노',
    artist: 'Piano',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1ecd.mp3?filename=relaxing-145038.mp3',
    favorite: false,
    type: 'audio'
  },
  {
    id: 3,
    title: '자연 소리',
    artist: 'Nature',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_942d7cf170.mp3?filename=birds-nature-forest-ambient-sound-127411.mp3',
    favorite: false,
    type: 'audio'
  },
];

const STORAGE_KEY = 'cottage-music-playlist';

const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const fetchYouTubeInfo = async (videoId: string): Promise<{title: string, artist: string, duration: number} | null> => {
  try {
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!oembedResponse.ok) throw new Error('Failed to fetch YouTube oembed info');
    
    const oembedData = await oembedResponse.json();
    
    try {
      return { 
        title: oembedData.title || 'Unknown Title', 
        artist: oembedData.author_name || 'Unknown Artist',
        duration: 0
      };
    } catch (error) {
      console.warn('YouTube Data API failed, using oembed data only:', error);
      return { 
        title: oembedData.title || 'Unknown Title', 
        artist: oembedData.author_name || 'Unknown Artist',
        duration: 0
      };
    }
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    return null;
  }
};

const YouTubeEmbed = ({ 
  videoId, 
  isPlaying, 
  volume, 
  onEnded, 
  onTimeUpdate, 
  onDurationChange, 
  showVideo = false,
  onPlayerReady
}: { 
  videoId: string, 
  isPlaying: boolean, 
  volume: number,
  onEnded: () => void,
  onTimeUpdate: (currentTime: number) => void,
  onDurationChange: (duration: number) => void,
  showVideo?: boolean,
  onPlayerReady?: () => void
}) => {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef<boolean>(false);
  
  const [playerState, setPlayerState] = useState<number | null>(null);
  
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT || !window.YT.Player) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = initPlayer;
      } else {
        initPlayer();
      }
    };
    
    loadYouTubeAPI();
    
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
      
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [videoId]);
  
  useEffect(() => {
    if (playerRef.current && playerReadyRef.current) {
      try {
        if (isPlaying) {
          if (playerState !== window.YT?.PlayerState?.PLAYING) {
            playerRef.current.playVideo();
          }
          
          if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
          }
          
          timeUpdateIntervalRef.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
              onTimeUpdate(playerRef.current.getCurrentTime());
            }
          }, 1000);
        } else {
          if (playerState !== window.YT?.PlayerState?.PAUSED && 
              playerState !== window.YT?.PlayerState?.ENDED) {
            playerRef.current.pauseVideo();
          }
          
          if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
            timeUpdateIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error controlling YouTube player:', error);
      }
    }
  }, [isPlaying, playerState]);
  
  useEffect(() => {
    if (playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.setVolume(volume * 100);
      } catch (error) {
        console.error('Error setting YouTube volume:', error);
      }
    }
  }, [volume]);
  
  const initPlayer = () => {
    if (!containerRef.current) return;
    
    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: showVideo ? '240' : '0',
        width: showVideo ? '100%' : '0',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: showVideo ? 1 : 0,
          disablekb: 1,
          fs: showVideo ? 1 : 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            playerReadyRef.current = true;
            
            try {
              event.target.setVolume(volume * 100);
              
              const duration = event.target.getDuration();
              onDurationChange(duration);
              
              if (isPlaying) {
                event.target.playVideo();
                setPlayerState(window.YT.PlayerState.PLAYING);
                
                if (timeUpdateIntervalRef.current) {
                  clearInterval(timeUpdateIntervalRef.current);
                }
                
                timeUpdateIntervalRef.current = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    try {
                      onTimeUpdate(playerRef.current.getCurrentTime());
                    } catch (error) {
                      console.error('Error getting current time:', error);
                    }
                  }
                }, 1000);
              }
              
              if (onPlayerReady) {
                onPlayerReady();
              }
            } catch (error) {
              console.error('Error in YouTube player onReady event:', error);
            }
          },
          onStateChange: (event: YT.PlayerEvent) => {
            try {
              setPlayerState(event.data);
              
              if (event.data === window.YT.PlayerState.ENDED) {
                if (timeUpdateIntervalRef.current) {
                  clearInterval(timeUpdateIntervalRef.current);
                  timeUpdateIntervalRef.current = null;
                }
                onEnded();
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                onTimeUpdate(event.target.getCurrentTime());
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                onTimeUpdate(event.target.getCurrentTime());
              }
            } catch (error) {
              console.error('Error in YouTube player onStateChange event:', error);
            }
          },
          onError: (event: { data: any }) => {
            console.error('YouTube player error:', event.data);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };
  
  return (
    <div className={`${showVideo ? 'mb-4' : 'hidden'}`}>
      <div ref={containerRef} data-youtube-container className={`w-full ${showVideo ? '' : 'hidden'}`} />
    </div>
  );
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
  
  namespace YT {
    class Player {
      constructor(element: Element | string, options: any);
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      seekTo(seconds: number, allowSeekAhead?: boolean): void;
      getPlayerState(): number;
      getCurrentTime(): number;
      getDuration(): number;
      setVolume(volume: number): void;
      destroy(): void;
    }
    
    interface PlayerState {
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
      UNSTARTED: number;
    }
    
    interface PlayerEvent {
      target: Player;
      data: any;
    }
  }
}

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedTracks = JSON.parse(saved);
          return parsedTracks.map((track: any) => ({
            ...track,
            type: track.type || 'audio'
          }));
        } catch (e) {
          return DEFAULT_TRACKS;
        }
      }
    }
    return DEFAULT_TRACKS;
  });
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Howl | null>(null);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlist' | 'add'>('playlist');
  const [isLoading, setIsLoading] = useState(false);
  const [showYouTubeVideo, setShowYouTubeVideo] = useState(false);
  const [isYouTubeAPIReady, setIsYouTubeAPIReady] = useState(false);
  const [youtubePlayerReady, setYoutubePlayerReady] = useState(false);
  
  const currentTrack = tracks[currentTrackIndex];
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    }
  }, [tracks]);
  
  useEffect(() => {
    if (!currentTrack) return;
    
    if (currentTrack.type === 'audio') {
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
      setYoutubePlayerReady(false);
    } else if (currentTrack.type === 'youtube') {
      if (currentTrack.duration) {
        setDuration(currentTrack.duration);
      }
      setSeek(0);
      setYoutubePlayerReady(false);
    }
    
    return () => {
      if (sound) {
        sound.stop();
      }
    };
  }, [currentTrackIndex, tracks]);
  
  const updateSeek = () => {
    if (sound && isPlaying && currentTrack?.type === 'audio') {
      setSeek(sound.seek() as number);
      requestAnimationFrame(updateSeek);
    }
  };
  
  const togglePlay = () => {
    if (!currentTrack) return;
    
    if (currentTrack.type === 'audio' && sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (sound && currentTrack?.type === 'audio') {
      sound.volume(isMuted ? 0 : newVolume);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (sound && currentTrack?.type === 'audio') {
      sound.volume(isMuted ? volume : 0);
    }
  };
  
  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };
  
  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
  };
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeek = parseFloat(e.target.value);
    setSeek(newSeek);
    
    if (currentTrack?.type === 'audio' && sound) {
      sound.seek(newSeek);
    }
  };
  
  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined || isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const selectTrack = (index: number) => {
    if (sound && tracks[currentTrackIndex]?.type === 'audio') {
      sound.stop();
    }
    
    setCurrentTrackIndex(index);
    
    setIsPlaying(true);
    
    if (tracks[index]?.type === 'youtube') {
      setYoutubePlayerReady(false);
    }
  };
  
  const addTrack = async () => {
    if (!newTrackUrl) return;
    
    setIsLoading(true);
    const youtubeId = extractYouTubeId(newTrackUrl);
    
    let title = newTrackTitle || '알 수 없는 트랙';
    let artist = newTrackArtist || '알 수 없음';
    let videoDuration = 0;
    
    if (youtubeId) {
      try {
        const info = await fetchYouTubeInfo(youtubeId);
        if (info) {
          title = newTrackTitle || info.title;
          artist = newTrackArtist || info.artist;
          videoDuration = info.duration;
        }
      } catch (error) {
        console.error('Error fetching YouTube info:', error);
      }
    }
    
    const newTrack: Track = {
      id: Date.now(),
      title,
      artist,
      url: newTrackUrl,
      favorite: false,
      type: youtubeId ? 'youtube' : 'audio',
      videoId: youtubeId || undefined,
      duration: videoDuration
    };
    
    setTracks([...tracks, newTrack]);
    setNewTrackUrl('');
    setNewTrackTitle('');
    setNewTrackArtist('');
    setActiveTab('playlist');
    setIsLoading(false);
  };
  
  const removeTrack = (id: number) => {
    const newTracks = tracks.filter(track => track.id !== id);
    setTracks(newTracks);
    
    if (currentTrack && currentTrack.id === id) {
      if (newTracks.length > 0) {
        setCurrentTrackIndex(0);
      } else {
        if (sound) {
          sound.stop();
        }
        setIsPlaying(false);
      }
    } else if (currentTrackIndex >= newTracks.length) {
      setCurrentTrackIndex(Math.max(0, newTracks.length - 1));
    }
  };
  
  const toggleFavorite = (id: number) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, favorite: !track.favorite } : track
    ));
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setShowPlaylist(false);
  };
  
  const toggleYouTubeVideo = () => {
    if (currentTrack?.type === 'youtube') {
      setShowYouTubeVideo(!showYouTubeVideo);
      
      if (!showYouTubeVideo) {
        const containerElement = document.querySelector('[data-youtube-container]');
        if (containerElement) {
          containerElement.classList.remove('hidden');
        }
      }
    }
  };
  
  const handleYouTubeTimeUpdate = (currentTime: number) => {
    setSeek(currentTime);
  };
  
  const handleYouTubeDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    
    if (currentTrack && currentTrack.type === 'youtube') {
      setTracks(tracks.map((track, index) => 
        index === currentTrackIndex ? { ...track, duration: newDuration } : track
      ));
    }
  };
  
  const handleYouTubePlayerReady = () => {
    setYoutubePlayerReady(true);
    if (currentTrack?.type === 'youtube') {
      setIsPlaying(true);
    }
  };
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-3 shadow-lg text-white flex items-center gap-2 z-50 cursor-pointer" onClick={toggleMinimize}>
        {currentTrack?.type === 'youtube' ? 
          <FiYoutube size={20} className="text-red-500" /> : 
          <FiMusic size={20} className="text-cottage-400" />
        }
        <div className="max-w-[120px] truncate">{currentTrack?.title || '음악 없음'}</div>
        {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
      </div>
    );
  }
  
  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-xl shadow-lg text-white overflow-hidden transition-all duration-300 max-h-screen flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-white/10">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FiMusic className="text-cottage-400" />
          <span>음악 플레이어</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 rounded-full ${showPlaylist ? 'bg-cottage-600 text-white' : 'hover:bg-white/10'}`}
            aria-label="재생목록"
          >
            <FiList size={18} />
          </button>
          <button
            onClick={toggleMinimize}
            className="p-2 hover:bg-white/10 rounded-full"
            aria-label="최소화"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            currentTrack?.type === 'youtube' ? 'bg-red-900/50' : 'bg-cottage-700/50'
          }`}>
            {currentTrack?.type === 'youtube' ? 
              <FiYoutube size={24} className="text-red-400" /> : 
              <FiMusic size={24} className="text-cottage-300" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-medium truncate">{currentTrack?.title || '트랙을 선택하세요'}</div>
            <div className="text-sm text-white/60 truncate">{currentTrack?.artist || ''}</div>
          </div>
          {currentTrack?.type === 'youtube' && (
            <button
              onClick={toggleYouTubeVideo}
              className={`p-2 rounded-full ${showYouTubeVideo ? 'bg-red-600/40' : 'hover:bg-white/10'}`}
              aria-label={showYouTubeVideo ? "영상 숨기기" : "영상 보기"}
            >
              <FiVideo size={18} />
            </button>
          )}
        </div>
        
        {currentTrack?.type === 'youtube' && currentTrack.videoId && (
          <YouTubeEmbed 
            videoId={currentTrack.videoId} 
            isPlaying={isPlaying} 
            volume={isMuted ? 0 : volume}
            onEnded={nextTrack}
            onTimeUpdate={handleYouTubeTimeUpdate}
            onDurationChange={handleYouTubeDurationChange}
            showVideo={showYouTubeVideo}
            onPlayerReady={handleYouTubePlayerReady}
          />
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={seek}
            onChange={handleSeekChange}
            disabled={currentTrack?.type === 'youtube'}
            className={`w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cottage-400 ${
              currentTrack?.type === 'youtube' ? 'opacity-50' : ''
            }`}
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevTrack}
            className="p-2 text-white/70 hover:text-white"
            aria-label="이전 트랙"
            disabled={tracks.length === 0}
          >
            <FiSkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-4 bg-cottage-500 hover:bg-cottage-600 text-white rounded-full transition-colors"
            aria-label={isPlaying ? '일시정지' : '재생'}
            disabled={tracks.length === 0}
          >
            {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
          </button>
          
          <button
            onClick={nextTrack}
            className="p-2 text-white/70 hover:text-white"
            aria-label="다음 트랙"
            disabled={tracks.length === 0}
          >
            <FiSkipForward size={20} />
          </button>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={toggleMute}
            className="p-2 text-white/70 hover:text-white mr-2"
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
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cottage-400"
          />
        </div>
      </div>
      
      {showPlaylist && (
        <div className="border-t border-white/10 flex flex-col h-[300px]">
          <div className="flex border-b border-white/10 flex-shrink-0">
            <button
              onClick={() => setActiveTab('playlist')}
              className={`flex-1 py-2 text-center ${activeTab === 'playlist' ? 'bg-white/10 font-medium' : ''}`}
            >
              재생목록
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 text-center ${activeTab === 'add' ? 'bg-white/10 font-medium' : ''}`}
            >
              트랙 추가
            </button>
          </div>
          
          {activeTab === 'playlist' && (
            <div className="overflow-y-scroll h-[250px]">
              {tracks.length === 0 ? (
                <div className="p-4 text-center text-white/50">
                  재생목록이 비어 있습니다
                </div>
              ) : (
                <ul>
                  {tracks.map((track, index) => (
                    <li 
                      key={track.id}
                      className={`flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer ${
                        currentTrackIndex === index ? 'bg-white/10' : ''
                      }`}
                      onClick={() => selectTrack(index)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                          currentTrackIndex === index ? 
                            (track.type === 'youtube' ? 'bg-red-600' : 'bg-cottage-600') : 
                            'bg-white/10'
                        }`}>
                          {currentTrackIndex === index && isPlaying ? (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1 h-3 bg-white animate-[soundBounce_0.8s_ease-in-out_infinite]"></div>
                              <div className="w-1 h-4 bg-white animate-[soundBounce_0.8s_ease-in-out_0.2s_infinite]"></div>
                              <div className="w-1 h-2 bg-white animate-[soundBounce_0.8s_ease-in-out_0.4s_infinite]"></div>
                            </div>
                          ) : (
                            track.type === 'youtube' ? <FiYoutube size={16} /> : <FiMusic size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{track.title}</div>
                          <div className="text-xs text-white/60 truncate">{track.artist}</div>
                          {track.duration && track.duration > 0 && (
                            <div className="text-xs text-white/40">{formatTime(track.duration)}</div>)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={`p-2 ${track.favorite ? 'text-cottage-400' : 'text-white/40 hover:text-white/60'}`}
                          aria-label={track.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        >
                          <FiHeart size={16} fill={track.favorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrack(track.id);
                          }}
                          className="p-2 text-white/40 hover:text-white/60"
                          aria-label="트랙 삭제"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {activeTab === 'add' && (
            <div className="p-3 overflow-y-scroll h-[250px]">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">유튜브 URL 또는 오디오 URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-white/20 rounded-md text-sm text-black focus:outline-none focus:border-cottage-400"
                  />
                </div>
              </div>
              
              <button
                onClick={addTrack}
                className={`w-full py-2 bg-cottage-500 hover:bg-cottage-600 rounded-md text-sm font-medium flex items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                disabled={!newTrackUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">불러오는 중...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  '트랙 추가'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
