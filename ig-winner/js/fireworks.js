// High-Impact Fireworks & Confetti Particle System
class FireworksFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.rockets = [];
    this.running = false;
    this.launchInterval = null;
    this.flashAlpha = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  start() {
    this.running = true;
    this.particles = [];
    this.rockets = [];
    this.flashAlpha = 0.45; // Initial camera/strobe flash

    // Launch barrage of initial rockets
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.running) this.launchRocket();
      }, i * 180);
    }

    this.launchInterval = setInterval(() => {
      if (this.running) {
        this.launchRocket();
        if (Math.random() > 0.35) this.launchRocket();
        if (Math.random() > 0.65) this.launchRocket();
      }
    }, 380);

    this.animate();
  }

  stop() {
    this.running = false;
    if (this.launchInterval) {
      clearInterval(this.launchInterval);
      this.launchInterval = null;
    }
  }

  clear() {
    this.stop();
    this.particles = [];
    this.rockets = [];
    this.flashAlpha = 0;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  launchRocket() {
    const startX = this.width * 0.1 + Math.random() * (this.width * 0.8);
    const targetX = startX + (Math.random() * 160 - 80);
    const targetY = this.height * 0.08 + Math.random() * (this.height * 0.38);

    const colors = [
      '#FFD700', // Bright Gold
      '#0062B8', // BYU Royal Blue
      '#FFFFFF', // Brilliant White
      '#FF8008', // Amber / Orange
      '#00E5FF', // Cyan Sparkle
      '#FF3E6C', // Party Red/Pink
      '#FFEAA7'  // Champagne
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.rockets.push({
      x: startX,
      y: this.height,
      targetX,
      targetY,
      speed: 14 + Math.random() * 5,
      color,
      radius: 3.5,
      trail: []
    });

    if (window.soundFX) {
      window.soundFX.playWhoosh();
    }
  }

  explode(x, y, color) {
    const count = 90 + Math.floor(Math.random() * 50);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.25);
      const speed = 2.0 + Math.random() * 7.5;
      const isConfetti = Math.random() > 0.45;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        decay: isConfetti ? 0.008 + Math.random() * 0.012 : 0.015 + Math.random() * 0.02,
        gravity: isConfetti ? 0.06 : 0.12,
        radius: isConfetti ? 2.5 + Math.random() * 3 : 2 + Math.random() * 2.5,
        isConfetti,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        flicker: Math.random() > 0.5
      });
    }

    if (window.soundFX) {
      window.soundFX.playFireworkBoom();
    }
  }

  animate() {
    if (!this.running && this.particles.length === 0 && this.rockets.length === 0 && this.flashAlpha <= 0) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      return;
    }

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Initial Flash
    if (this.flashAlpha > 0) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.flashAlpha -= 0.03;
    }

    this.ctx.globalCompositeOperation = 'lighter';

    // Update rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      const dx = r.targetX - r.x;
      const dy = r.targetY - r.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < r.speed || r.y <= r.targetY) {
        this.explode(r.targetX, r.targetY, r.color);
        this.rockets.splice(i, 1);
      } else {
        r.x += (dx / dist) * r.speed;
        r.y += (dy / dist) * r.speed;

        this.ctx.save();
        this.ctx.fillStyle = r.color;
        this.ctx.shadowColor = r.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      const currentAlpha = p.flicker && Math.random() > 0.4 ? p.alpha * 0.6 : p.alpha;
      this.ctx.globalAlpha = Math.max(0, currentAlpha);
      this.ctx.fillStyle = p.color;

      if (p.isConfetti) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.fillRect(-p.radius, -p.radius * 1.8, p.radius * 2, p.radius * 3.6);
      } else {
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 4;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}
