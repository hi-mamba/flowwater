// 轻量音频系统：BGM 用 <audio>，SFX 用 Web Audio 合成（避免依赖资源文件）
// 不强依赖 Phaser，可被任何 scene 使用。
//
// 用户首次交互前浏览器会拒绝播放——所有 play() 调用都被 try/catch 包住，失败安静忽略。

const MUTE_KEY = 'flowwater_audio_muted_v1';
let muted = false;
try {
  if (typeof localStorage !== 'undefined') muted = localStorage.getItem(MUTE_KEY) === '1';
} catch { /* ignore */ }

const listeners = new Set<(m: boolean) => void>();

export function isMuted(): boolean { return muted; }

export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* ignore */ }
  if (m) stopBgm();
  listeners.forEach(fn => fn(m));
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

/** 订阅静音变化。返回取消订阅函数 */
export function subscribeMute(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (muted) return null;
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** 单次播放一段合成音效。type: 振荡器类型；freq: 起始频率；durMs: 总时长 */
function blip(opts: {
  freq: number;
  durMs: number;
  type?: OscillatorType;
  freqEnd?: number;
  vol?: number;
  filterFreq?: number;
}) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = opts.filterFreq ?? 6000;
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, c.currentTime);
    if (opts.freqEnd != null) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.freqEnd),
        c.currentTime + opts.durMs / 1000
      );
    }
    const peak = opts.vol ?? 0.18;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(peak, c.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + opts.durMs / 1000);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + opts.durMs / 1000);
  } catch {
    // 静默失败
  }
}

/** 短促噪声（用于受击/爆破） */
function noise(durMs: number, vol = 0.18, filterFreq = 1800) {
  const c = getCtx();
  if (!c) return;
  try {
    const buffer = c.createBuffer(1, (c.sampleRate * durMs) / 1000, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durMs / 1000);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    src.start();
  } catch {
    // ignore
  }
}

export const sfx = {
  attack() {
    blip({ freq: 720, freqEnd: 220, durMs: 140, type: 'square', vol: 0.12, filterFreq: 4000 });
  },
  hit() {
    noise(160, 0.15, 1400);
    blip({ freq: 180, freqEnd: 60, durMs: 200, type: 'sawtooth', vol: 0.1 });
  },
  bossDown() {
    blip({ freq: 200, freqEnd: 800, durMs: 350, type: 'triangle', vol: 0.18 });
    setTimeout(() => blip({ freq: 600, freqEnd: 1200, durMs: 250, type: 'triangle', vol: 0.18 }), 120);
  },
  dodge() {
    blip({ freq: 1100, freqEnd: 1800, durMs: 90, type: 'sine', vol: 0.1 });
  },
  death() {
    blip({ freq: 300, freqEnd: 50, durMs: 700, type: 'sawtooth', vol: 0.2 });
    setTimeout(() => noise(400, 0.2, 700), 100);
  },
  telegraph() {
    blip({ freq: 280, freqEnd: 220, durMs: 700, type: 'sine', vol: 0.06 });
  },

  // ---- 老游戏专用 ----
  /** 2048 / 翻牌：方块合并、配对成功 */
  merge() {
    blip({ freq: 440, freqEnd: 660, durMs: 90, type: 'triangle', vol: 0.12 });
  },
  /** 贪吃蛇：吃到食物 */
  eat() {
    blip({ freq: 880, freqEnd: 1320, durMs: 70, type: 'square', vol: 0.1, filterFreq: 5000 });
  },
  /** 炼丹：成功收丹 */
  pillSuccess() {
    blip({ freq: 660, freqEnd: 990, durMs: 120, type: 'triangle', vol: 0.14 });
    setTimeout(() => blip({ freq: 990, freqEnd: 1320, durMs: 150, type: 'sine', vol: 0.12 }), 80);
  },
  /** 炼丹炸炉 / 翻牌错误 */
  fail() {
    blip({ freq: 200, freqEnd: 80, durMs: 280, type: 'sawtooth', vol: 0.16 });
  },
  /** UI 点击 */
  click() {
    blip({ freq: 1000, durMs: 30, type: 'sine', vol: 0.08 });
  },
};

// ---- BGM：用 Web Audio 合成的低音 pad 循环，避免与全局《不凡》主题曲冲突 ----
let bgmNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode }[] = [];

export function playBgm(_unused?: string, volume = 0.06) {
  const c = getCtx();
  if (!c) return;
  stopBgm();
  // 三个层叠 pad 音：根音 + 五度 + 高八度，加 LFO 让其呼吸
  const freqs = [110, 165, 220]; // A2 + E3 + A3
  for (const f of freqs) {
    try {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const gain = c.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(volume, c.currentTime + 1.2);

      // LFO 给 gain 一个 0.2~0.4 Hz 的呼吸
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.25 + Math.random() * 0.15;
      const lfoGain = c.createGain();
      lfoGain.gain.value = volume * 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      osc.start();
      lfo.start();
      bgmNodes.push({ osc, gain, lfo, lfoGain });
    } catch {
      // ignore
    }
  }
}

export function stopBgm() {
  const c = getCtx();
  for (const n of bgmNodes) {
    try {
      if (c) {
        n.gain.gain.cancelScheduledValues(c.currentTime);
        n.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
        n.osc.stop(c.currentTime + 0.5);
        n.lfo.stop(c.currentTime + 0.5);
      } else {
        n.osc.stop();
        n.lfo.stop();
      }
    } catch {
      // ignore
    }
  }
  bgmNodes = [];
}

export function isBgmPlaying() {
  return bgmNodes.length > 0;
}
