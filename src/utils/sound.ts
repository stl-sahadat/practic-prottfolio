// Sound manager for ITom-style hand-drawn portfolio - Chrome & Cross-Browser Safe
class SoundManager {
  private enabled: boolean = true;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private sharedCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-cache sounds
      const base = import.meta.env.BASE_URL || '/';
      const resolveUrl = (s: string) => (s.startsWith('/') && base !== '/' ? `${base}${s.slice(1)}` : s);
      const sounds = [
        { key: 'door_creak', src: resolveUrl('/sounds/uchyleniedrzwi.mp3') },
        { key: 'door_open', src: resolveUrl('/sounds/otwarciedrzwi.mp3') },
        { key: 'door_close', src: resolveUrl('/sounds/zamknieciedrzwi.mp3') },
        { key: 'wind', src: resolveUrl('/sounds/szumwiatru.mp3') },
        { key: 'city', src: resolveUrl('/sounds/szummiasta.mp3') },
      ];

      sounds.forEach(({ key, src }) => {
        try {
          const audio = new Audio(src);
          audio.preload = 'auto';
          this.audioCache.set(key, audio);
        } catch {
          // Ignore
        }
      });
    }
  }

  // Get or lazily create a single shared AudioContext to prevent Chrome AudioContext limit (max 6)
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.sharedCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.sharedCtx = new AudioCtxClass();
        }
      }
      if (this.sharedCtx && this.sharedCtx.state === 'suspended') {
        this.sharedCtx.resume().catch(() => {});
      }
      return this.sharedCtx;
    } catch {
      return null;
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public play(key: string, volume: number = 0.5) {
    if (!this.enabled) return;
    try {
      const audio = this.audioCache.get(key);
      if (audio) {
        audio.currentTime = 0;
        audio.volume = Math.min(Math.max(volume, 0), 1);
        audio.play().catch(() => {
          // Autoplay policy prevented playback until user interaction
        });
      }
    } catch {
      // Ignored
    }
  }

  public playDoorCreak() {
    this.play('door_creak', 0.4);
  }

  public playDoorOpen() {
    this.play('door_open', 0.6);
  }

  public playDoorClose() {
    this.play('door_close', 0.5);
  }

  public playHoverChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state === 'suspended') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignored
    }
  }

  public playAchievement() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || ctx.state === 'suspended') return;

      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.05, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.15);
      });
    } catch {
      // Ignored
    }
  }
}

export const soundManager = new SoundManager();
