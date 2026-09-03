// Enhanced Audio Engine with Open Access Background Music & Web Audio FX
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgMusic = null;
    this.celebrationMusic = null;
    this.musicVolume = 0.55;
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
          if (this.bgMusic.volume > 0.05) {
            this.bgMusic.volume = Math.max(0, this.bgMusic.volume - 0.08);
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

  playWhoosh() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.35);
      filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.7);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(360, this.ctx.currentTime + 0.35);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.7);
    } catch (e) {}
  }

  playEliminatePop() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const f = 220 + Math.random() * 450;
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  }

  playTick(pitch = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480 * pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240 * pitch, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playFireworkBoom() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);

      // Crackle
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.14));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 900;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, this.ctx.currentTime + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.48);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playFanfare() {
    if (this.muted || !this.ctx) return;
    const notes = [
      { f: 261.63, start: 0.0, dur: 0.2 },
      { f: 329.63, start: 0.18, dur: 0.2 },
      { f: 392.00, start: 0.36, dur: 0.25 },
      { f: 523.25, start: 0.60, dur: 1.6 },
      { f: 659.25, start: 0.60, dur: 1.6 },
      { f: 783.99, start: 0.60, dur: 1.6 }
    ];

    notes.forEach(n => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, this.ctx.currentTime + n.start);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, this.ctx.currentTime + n.start);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime + n.start);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + n.start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.start + n.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + n.start);
        osc.stop(this.ctx.currentTime + n.start + n.dur);
      } catch (e) {}
    });
  }
}

window.soundFX = new SoundFX();
