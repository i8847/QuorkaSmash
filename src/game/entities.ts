import { CONFIG } from './config';

export class Entity {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public vx: number = 0;
  public vy: number = 0;
  public active: boolean = true;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  get bounds() {
    return {
      x: this.x - this.w / 2,
      y: this.y - this.h / 2,
      w: this.w,
      h: this.h,
    };
  }
}

export class Paddle extends Entity {
  public targetX: number;
  public speed: number;
  public hitCooldown: number = 0;

  constructor(x: number, y: number) {
    super(x, y, CONFIG.PADDLE_WIDTH, CONFIG.PADDLE_HEIGHT);
    this.targetX = x;
    this.speed = CONFIG.PADDLE_SPEED;
  }

  public update(dt: number, courtWidth: number) {
    if (this.hitCooldown > 0) {
      this.hitCooldown -= dt;
    }

    // Smooth lerp tracking to targetX
    const dx = this.targetX - this.x;
    this.vx = dx / (dt || 0.016);
    this.x += dx * CONFIG.FOLLOW_LERP;

    // Clamp within court boundaries
    const halfW = this.w / 2;
    if (this.x - halfW < 12) {
      this.x = 12 + halfW;
    } else if (this.x + halfW > courtWidth - 12) {
      this.x = courtWidth - 12 - halfW;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const halfW = this.w / 2;
    const halfH = this.h / 2;
    const px = this.x - halfW;
    const py = this.y - halfH;

    ctx.save();

    // Soft drop shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // Outer paddle border / rubber rim
    const radius = 10;
    ctx.beginPath();
    ctx.roundRect(px, py, this.w, this.h, radius);
    ctx.fillStyle = '#0F172A'; // Dark slate
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Paddle rubber face gradient (vibrant ruby red table-tennis rubber)
    const rubberGradient = ctx.createLinearGradient(px, py, px, py + this.h);
    rubberGradient.addColorStop(0, '#E11D48'); // Rose-600
    rubberGradient.addColorStop(1, '#BE123C'); // Rose-700

    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, this.w - 4, this.h - 4, radius - 2);
    ctx.fillStyle = rubberGradient;
    ctx.fill();

    // Grip center sweet-spot indicator
    ctx.beginPath();
    ctx.roundRect(this.x - 14, py + 3, 28, this.h - 6, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Micro decorative sticker: "STAY" or Star in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STAY ✦', this.x, this.y);

    ctx.restore();
  }
}

export class Quorka extends Entity {
  public radius: number;
  public spin: number = 0;
  public hitFlash: number = 0;
  public combo: number = 0;
  public blinkTimer: number = 0;
  public isBlinking: boolean = false;
  public trail: { x: number; y: number; alpha: number; spin: number }[] = [];

  constructor(x: number, y: number) {
    super(x, y, CONFIG.QUORKA_RADIUS * 2, CONFIG.QUORKA_RADIUS * 2);
    this.radius = CONFIG.QUORKA_RADIUS;
    this.vx = CONFIG.INITIAL_VX;
    this.vy = CONFIG.INITIAL_VY;
  }

  public update(dt: number) {
    // Add to motion trail
    this.trail.unshift({ x: this.x, y: this.y, alpha: 0.5, spin: this.spin });
    if (this.trail.length > 7) {
      this.trail.pop();
    }

    // Fade trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha *= 0.72;
    }

    // Blink timer
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.2) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.35) {
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 0.8;
      }
    }

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Draw motion trail if combo is active
    if (this.combo >= 2) {
      for (const t of this.trail) {
        if (t.alpha <= 0.05) continue;
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.spin);
        ctx.globalAlpha = t.alpha * 0.45;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = this.combo >= 10 ? '#F59E0B' : '#FB7185';
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. Main Quorka positioning and spin
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);

    // Glowing aura on high combo
    if (this.combo >= 5) {
      ctx.save();
      const auraPulse = Math.sin(Date.now() * 0.01) * 3 + 6;
      ctx.shadowColor = this.combo >= 15 ? '#F59E0B' : '#EC4899';
      ctx.shadowBlur = 14 + auraPulse;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = this.combo >= 15 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(236, 72, 153, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    const r = this.radius;

    // --- Stray-cat / Quorka Ears ---
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-r * 0.65, -r * 0.65, r * 0.38, r * 0.45, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#C2783E'; // Warm quokka caramel
    ctx.fill();
    // Left inner ear
    ctx.beginPath();
    ctx.ellipse(-r * 0.65, -r * 0.65, r * 0.22, r * 0.28, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#F472B6'; // Soft pink
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.ellipse(r * 0.65, -r * 0.65, r * 0.38, r * 0.45, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#C2783E';
    ctx.fill();
    // Right inner ear
    ctx.beginPath();
    ctx.ellipse(r * 0.65, -r * 0.65, r * 0.22, r * 0.28, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#F472B6';
    ctx.fill();

    // --- Fluffy Quokka Body ---
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 4, 0, 0, r);
    bodyGrad.addColorStop(0, '#E79B5A'); // Honey highlight
    bodyGrad.addColorStop(0.7, '#D48344'); // Golden quokka fur
    bodyGrad.addColorStop(1, '#B4662A'); // Shadowed rim
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Cheek fluff bumps
    ctx.beginPath();
    ctx.arc(-r * 0.85, r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.arc(r * 0.85, r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#D48344';
    ctx.fill();

    // Belly / Muzzle lighter patch
    ctx.beginPath();
    ctx.ellipse(0, r * 0.22, r * 0.52, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE68A'; // Warm cream
    ctx.fill();

    // Cheek blush (rosy cute Stay blush)
    ctx.beginPath();
    ctx.arc(-r * 0.52, r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.52, r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.42)'; // Rose pink blush
    ctx.fill();

    // Micro "STAY" tattoo on left cheek
    ctx.save();
    ctx.fillStyle = '#BE123C';
    ctx.font = 'bold 6px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STAY', -r * 0.52, r * 0.44);
    ctx.restore();

    // --- Cute Eyes ---
    if (this.isBlinking) {
      // Blinking closed happy curve: ^ ^
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#27170C';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r * 0.35, -r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // Large shiny round chibi eyes
      const eyeR = r * 0.2;
      const eyeY = -r * 0.05;

      // Left eye
      ctx.beginPath();
      ctx.arc(-r * 0.35, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#27170C';
      ctx.fill();
      // Sparkle highlights
      ctx.beginPath();
      ctx.arc(-r * 0.39, eyeY - eyeR * 0.35, eyeR * 0.38, 0, Math.PI * 2);
      ctx.arc(-r * 0.29, eyeY + eyeR * 0.3, eyeR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.arc(r * 0.35, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#27170C';
      ctx.fill();
      // Sparkle highlights
      ctx.beginPath();
      ctx.arc(r * 0.31, eyeY - eyeR * 0.35, eyeR * 0.38, 0, Math.PI * 2);
      ctx.arc(r * 0.41, eyeY + eyeR * 0.3, eyeR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    // --- Quokka Nose & Cheerful Mouth ---
    // Cute triangle button nose
    ctx.beginPath();
    ctx.ellipse(0, r * 0.12, r * 0.13, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1E140F';
    ctx.fill();

    // Smiling ":3" quokka mouth
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#1E140F';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(-r * 0.13, r * 0.24, r * 0.12, 0, Math.PI * 0.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(r * 0.13, r * 0.24, r * 0.12, Math.PI * 0.15, Math.PI);
    ctx.stroke();

    // Tiny pink tongue sticking out when combo > 5
    if (this.combo >= 5) {
      ctx.beginPath();
      ctx.arc(0, r * 0.32, r * 0.08, 0, Math.PI);
      ctx.fillStyle = '#FB7185';
      ctx.fill();
    }

    // --- Tiny SKZ Nachimbong Lightstick Accessory on Head ---
    // Stick base
    ctx.save();
    ctx.translate(r * 0.4, -r * 0.82);
    ctx.rotate(0.35);

    // Lightstick handle
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-2, 0, 4, 14);

    // Compass globe (Nachimbong)
    ctx.beginPath();
    ctx.arc(0, -6, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#EF4444'; // Red compass needle ring
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Red compass needle inside
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(3, -5);
    ctx.lineTo(-3, -5);
    ctx.closePath();
    ctx.fillStyle = '#DC2626';
    ctx.fill();

    ctx.restore();

    // --- Hit Flash Overlay ---
    if (this.hitFlash > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(this.hitFlash * 5, 0.75)})`;
      ctx.fill();
    }

    ctx.restore();
  }
}

export type ParticleType = 'heart' | 'star' | 'spark' | 'nachimbong';

export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public size: number;
  public color: string;
  public type: ParticleType;
  public rotation: number = 0;
  public vRot: number = 0;

  constructor(x: number, y: number, color: string, type: ParticleType = 'heart') {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 260;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 100;
    this.maxLife = 0.5 + Math.random() * 0.5;
    this.life = this.maxLife;
    this.size = 7 + Math.random() * 8;
    this.color = color;
    this.type = type;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 8;
  }

  public update(dt: number): boolean {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 320 * dt; // mild particle gravity
    this.vx *= 0.98;
    this.rotation += this.vRot * dt;
    this.life -= dt;
    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;

    if (this.type === 'heart') {
      // Draw cute heart
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const s = this.size * 0.6;
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.6, 0, s * 1.6);
      ctx.bezierCurveTo(s * 1.5, s * 0.6, s, -s * 0.5, 0, s * 0.4);
      ctx.fill();
    } else if (this.type === 'star') {
      // Draw 5-pointed star
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const spikes = 5;
      const outerR = this.size;
      const innerR = this.size * 0.45;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Spark circle
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    ctx.restore();
  }
}

export class ScorePopup {
  public x: number;
  public y: number;
  public text: string;
  public subtext?: string;
  public color: string;
  public life: number;
  public maxLife: number;

  constructor(x: number, y: number, text: string, color: string = '#E11D48', subtext?: string) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.subtext = subtext;
    this.color = color;
    this.maxLife = CONFIG.POPUP_DURATION;
    this.life = this.maxLife;
  }

  public update(dt: number): boolean {
    this.y -= 75 * dt; // float upwards
    this.life -= dt;
    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const progress = 1 - this.life / this.maxLife;
    const alpha = Math.max(0, this.life / this.maxLife);
    const scale = 1 + Math.sin(progress * Math.PI) * 0.25;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;

    ctx.fillStyle = this.color;
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, 0, 0);

    if (this.subtext) {
      ctx.font = '700 11px "JetBrains Mono", sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(this.subtext, 0, 18);
    }

    ctx.restore();
  }
}
