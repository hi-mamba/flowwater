import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Mic, X } from 'lucide-react';

export default function ReminderManager() {
  const { getNextReminder, addLog, settings, updateSectNpcs } = useStore();
  const [isReminding, setIsReminding] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      updateSectNpcs();
    }, 10000); // 每10秒更新一次NPC修为
    return () => clearInterval(interval);
  }, [updateSectNpcs]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized:', transcript);
        if (transcript.includes('喝了') || transcript.includes('搞定')) {
          handleDrink();
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const [lastTriggeredTime, setLastTriggeredTime] = useState<number | null>(null);
  const [currentReminderPlan, setCurrentReminderPlan] = useState<any>(null);

  useEffect(() => {
    const checkReminder = () => {
      const next = getNextReminder();
      if (next && !isReminding) {
        const now = Date.now();
        // Trigger if we are past the next reminder time, within a 1-minute window,
        // and we haven't already triggered for this specific reminder time.
        if (now >= next.time && now - next.time < 60000 && lastTriggeredTime !== next.time) {
          setLastTriggeredTime(next.time);
          setCurrentReminderPlan(next.plan);
          triggerReminder();
        }
      }
    };

    const interval = setInterval(checkReminder, 1000);
    return () => clearInterval(interval);
  }, [getNextReminder, isReminding, lastTriggeredTime]);

  const triggerReminder = () => {
    setIsReminding(true);

    // 1. Pre-warning: Vibration (Forced as per user request)
    if (navigator.vibrate) {
      try {
        if (settings.vibrationMode === 'drop') navigator.vibrate([100, 50, 100]);
        else if (settings.vibrationMode === 'heartbeat') navigator.vibrate([100, 100, 100, 100, 100]);
        else navigator.vibrate([500, 200, 500, 200, 500]); // Default strong vibration
      } catch (e) {
        console.error('Vibration failed:', e);
      }
    }

    // 2. Play Music
    if (settings.music !== 'none') {
      try {
        let audioSrc = 'https://actions.google.com/sounds/v1/water/water_drop.ogg';
        if (settings.music === 'custom' && settings.customMusicUrl) {
          audioSrc = settings.customMusicUrl;
        } else if (settings.music === 'forest') {
          audioSrc = 'https://actions.google.com/sounds/v1/water/water_stream_in_forest.ogg';
        } else if (settings.music === 'boil') {
          audioSrc = 'https://actions.google.com/sounds/v1/water/boiling_water.ogg';
        }

        if (!audioRef.current || audioRef.current.src !== audioSrc) {
          audioRef.current = new Audio(audioSrc);
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.error('Audio playback blocked by browser autoplay policy:', e);
          // Fallback to AudioContext if HTML5 Audio is blocked
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 1);
        });
      } catch (e) {
        console.error('Audio playback failed:', e);
      }
    }

    // 3. Start Voice Recognition if enabled
    if (settings.voiceCommandEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Speech recognition error:', e);
      }
    }

    // 4. System Notification
    if (settings.systemNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('悦泉提醒 💧', {
        body: '老板没看到你，快喝口水摸个鱼！',
        icon: '/vite.svg'
      });
    }
  };

  const handleDrink = () => {
    if (currentReminderPlan?.type === 'cultivation') {
      addLog(500, 'cultivation');
      useStore.setState((state) => ({
        spiritStones: state.spiritStones + 50
      }));
    } else {
      addLog(250, 'water');
      useStore.setState((state) => ({
        spiritStones: state.spiritStones + 10
      }));
    }
    closeReminder();
  };

  const closeReminder = () => {
    setIsReminding(false);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <AnimatePresence>
      {isReminding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
        >
          <button 
            onClick={closeReminder}
            className="absolute top-8 right-8 text-slate-400 hover:text-white"
          >
            <X size={32} />
          </button>

          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-48 h-48 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(56,189,248,0.4)] mb-12 ${
                currentReminderPlan?.type === 'cultivation' 
                  ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_60px_rgba(168,85,247,0.4)]'
                  : 'bg-gradient-to-tr from-sky-400 to-emerald-400 shadow-[0_0_60px_rgba(56,189,248,0.4)]'
              }`}
            >
              <Droplets size={64} className="text-white" />
            </motion.div>

            <h2 className="text-3xl font-light text-white mb-4">
              {currentReminderPlan?.type === 'cultivation' ? '该修炼啦' : '该喝水啦'}
            </h2>
            <p className="text-slate-400 mb-12">
              {currentReminderPlan?.type === 'cultivation' ? '凝神静气，运转周天' : '补充水分，保持活力'}
            </p>

            <button
              onClick={handleDrink}
              className={`text-white rounded-full py-4 px-16 text-xl font-medium shadow-lg transition-colors mb-8 ${
                currentReminderPlan?.type === 'cultivation'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {currentReminderPlan?.type === 'cultivation' ? '开始修炼' : '我刚喝了'}
            </button>

            {settings.voiceCommandEnabled && (
              <div className="flex items-center space-x-2 text-slate-500">
                <Mic size={16} className={isListening ? "text-emerald-400 animate-pulse" : ""} />
                <span className="text-sm">
                  {isListening ? "正在聆听... 请说「喝了」" : "语音识别已就绪"}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
