import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Music, Pause, Play, Volume2, VolumeX, Upload } from 'lucide-react';

const DB_NAME = 'MusicPlayerDB';
const STORE_NAME = 'files';
const FILE_KEY = 'theme-song';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToDB = async (file: File) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ file, name: file.name }, FILE_KEY);
  } catch (err) {
    console.error("Failed to save to indexedDB", err);
  }
};

const loadFileFromDB = async (): Promise<{ file: File, name: string } | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(FILE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load from indexedDB", err);
    return null;
  }
};

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 暂时为空，需要用户手动上传 MP3 音乐文件
  const [songUrl, setSongUrl] = useState('');
  const [songTitle, setSongTitle] = useState('凡人修仙传 主题曲《不凡》');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从 IndexedDB 加载之前的本地音频
  useEffect(() => {
    let isMounted = true;
    const initMusic = async () => {
      const storedData = await loadFileFromDB();
      if (storedData && isMounted) {
        const objectUrl = URL.createObjectURL(storedData.file);
        setSongUrl(objectUrl);
        setSongTitle(storedData.name.replace(/\.[^/.]+$/, ""));
      }
      if (isMounted) setIsLoading(false);
    };
    initMusic();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (audioRef.current && !isLoading) {
      audioRef.current.volume = 0.5;
    }
  }, [isLoading]);

  const togglePlay = () => {
    if (!songUrl) {
      // 如果没有选音乐，主动弹出选择文件
      fileInputRef.current?.click();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed:", e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await saveFileToDB(file);
      const objectUrl = URL.createObjectURL(file);
      setSongUrl(objectUrl);
      setSongTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  useEffect(() => {
    if (songUrl && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Auto playback failed:", e);
          setIsPlaying(false);
        });
    }
  }, [songUrl]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end">
      <audio 
        ref={audioRef} 
        src={songUrl || undefined} 
        loop
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          console.log("Audio source failed to load (likely empty or invalid).");
          setIsPlaying(false);
        }}
      />
      
      {/* Hidden file input for uploading MP3 */}
      <input 
        type="file" 
        accept="audio/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />
      
      {showPlayer ? (
        <motion.div 
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <div className="h-8 w-8 rounded-full bg-cyan-900/50 flex flex-shrink-0 items-center justify-center relative overflow-hidden">
            <div className={`absolute inset-0 bg-cyan-500/20 ${isPlaying ? 'animate-pulse' : ''}`} />
            <Music size={14} className="text-cyan-400" />
            {isPlaying && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-cyan-500/50 rounded-full" 
                style={{ borderStyle: 'dashed' }}
              />
            )}
          </div>
          
          <div className="flex flex-col flex-1 min-w-[120px] max-w-[150px]">
            <span className="text-xs text-slate-200 font-bold truncate" title={songTitle}>{songTitle}</span>
            <span className="text-[9px] text-slate-400">仙路漫漫，何为凡人</span>
          </div>
          
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/50">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="导入本地下载的《不凡》MP3"
            >
              <Upload size={14} />
            </button>
            <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition-colors">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition-colors">
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button 
              onClick={() => setShowPlayer(false)} 
              className="px-2 py-1 ml-1 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/50 rounded-full transition-colors"
            >
              收起
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPlayer(true)}
          className={`h-10 w-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)] ${isPlaying ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
        >
          <Music size={16} className={isPlaying ? 'text-cyan-400' : 'text-slate-400'} />
        </motion.button>
      )}
    </div>
  );
};
