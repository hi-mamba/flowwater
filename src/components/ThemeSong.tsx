import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { isMuted, subscribeMute } from '../games/audio';

const SONG_PATH = '/bufan.mp3';

export default function ThemeSong() {
  const { tribulation, levelIndex, settings } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevLevel = useRef(levelIndex);
  const prevTribActive = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [muted, setMutedState] = useState(() => isMuted());

  // 全局静音同步：mute 切换时立即停 song，再开启时不会自动播
  useEffect(() => subscribeMute((m) => {
    setMutedState(m);
    if (m && audioRef.current) {
      audioRef.current.pause();
    }
  }), []);

  // Initialize audio
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(SONG_PATH);
      audioRef.current.volume = volume;
      audioRef.current.loop = false;
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setTrackProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setTrackProgress(0);
      });
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }
    return audioRef.current;
  }, [volume]);

  const playSong = useCallback(() => {
    if (isMuted()) return; // 全局静音时不主动起播
    try {
      const audio = getAudio();
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  }, [getAudio, volume]);

  const stopSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setTrackProgress(0);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = getAudio();
    if (audio.paused) {
      if (isMuted()) return;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [getAudio]);

  const changeVolume = useCallback((v: number) => {
    const newVol = Math.max(0, Math.min(1, v));
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  }, []);

  // Watch for tribulation — auto play + loop
  useEffect(() => {
    if (tribulation.active && !prevTribActive.current) {
      const audio = getAudio();
      audio.loop = true;
      playSong();
    }
    if (!tribulation.active && prevTribActive.current) {
      if (audioRef.current) audioRef.current.loop = false;
      stopSong();
    }
    prevTribActive.current = tribulation.active;
  }, [tribulation.active, playSong, stopSong, getAudio]);

  // Watch for 元婴+ breakthroughs — auto play once
  useEffect(() => {
    if (levelIndex !== prevLevel.current) {
      const currentLevel = CULTIVATION_LEVELS[levelIndex];
      const prevLevelName = CULTIVATION_LEVELS[prevLevel.current]?.name || '凡人';
      const isYuanYingOrAbove = levelIndex >= 22;
      const isMajorBreakthrough =
        currentLevel?.name?.includes('初期') && !prevLevelName?.includes('巅峰');

      if (isYuanYingOrAbove && isMajorBreakthrough) {
        playSong();
      }
      prevLevel.current = levelIndex;
    }
  }, [levelIndex, playSong]);

  return (
    <>
      {/* Floating music button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-24 right-4 z-[90] w-10 h-10 rounded-full bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-lg flex items-center justify-center"
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Music size={16} className={muted ? 'text-slate-600' : isPlaying ? 'text-emerald-400' : 'text-slate-400'} />
        </motion.div>
      </motion.button>

      {/* Music controls panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-36 right-4 z-[90] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 w-56 shadow-2xl"
          >
            {/* Title */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-bold text-white">不凡</div>
                <div className="text-[10px] text-slate-500">凡人修仙传 主题曲</div>
              </div>
              <button onClick={() => setShowControls(false)}
                className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                animate={{ width: `${trackProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-3 mb-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={16} className="text-emerald-400" />
                ) : (
                  <Play size={16} className="text-emerald-400" />
                )}
              </motion.button>
            </div>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button onClick={() => changeVolume(volume - 0.1)}>
                {volume === 0 ? (
                  <VolumeX size={14} className="text-slate-500" />
                ) : (
                  <Volume2 size={14} className="text-slate-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Now playing animation */}
            {isPlaying && (
              <div className="flex items-center justify-center space-x-0.5 mt-3 h-6">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full"
                    animate={{ height: [4, 16, 8, 20, 12][i] }}
                    transition={{ duration: 0.5 + i * 0.15, repeat: Infinity, repeatType: 'reverse' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
