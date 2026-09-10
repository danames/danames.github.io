// Enhanced Audio Engine with Open Access Background Music & Web Audio FX
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgMusic = null;
    this.celebrationMusic = null;
    this.musicVolume = 0.22;
    this.initAudioElements();
  }

  initAudioElements() {
    // Open Access CC0 Music Tracks
    this.bgMusic = new Audio('assets/audio/cyclone-suspense.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;

    this.celebrationMusic = new Audio('assets/audio/celebration.mp3');
    this.celebrationMusic.loop = true;
    this.celebrationMusic.volume = this.musicVolume;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.bgMusic) this.bgMusic.muted = this.muted;
    if (this.celebrationMusic) this.celebrationMusic.muted = this.muted;
    return this.muted;
  }

  playCycloneMusic() {
    if (this.muted) return;
    try {
      this.stopAllMusic();
      if (this.bgMusic) {
        this.bgMusic.currentTime = 0;
        this.bgMusic.volume = this.musicVolume;
        this.bgMusic.play().catch(e => {
          console.warn('Autoplay prevented music; user interaction needed', e);
        });
      }
    } catch (e) {}
  }

  playCelebrationMusic() {
    if (this.muted) return;
    try {
      // Fade out cyclone music and start celebration
      if (this.bgMusic && !this.bgMusic.paused) {
        let fadeOut = setInterval(() => {
          if (this.bgMusic.volume > 0.03) {
            this.bgMusic.volume = Math.max(0, this.bgMusic.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            this.bgMusic.pause();
          }
        }, 80);
      }

      if (this.celebrationMusic) {
        this.celebrationMusic.currentTime = 0;
        this.celebrationMusic.volume = this.musicVolume;
        this.celebrationMusic.play().catch(e => console.warn(e));
      }
    } catch (e) {}
  }

  stopAllMusic() {
    try {
      if (this.bgMusic) {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
      }
      if (this.celebrationMusic) {
        this.celebrationMusic.pause();
        this.celebrationMusic.currentTime = 0;
      }
    } catch (e) {}
  }

  // Dramatic sounds disabled per user request
  playWhoosh() {
    // Disabled
  }

  playEliminatePop() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const f = 200 + Math.random() * 300;
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playTick(pitch = 1.0) {
    // Disabled dramatic tick
  }

  playFireworkBoom() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {}
  }

  playFanfare() {
    // Disabled dramatic brass fanfare
  }
}

window.soundFX = new SoundFX();
