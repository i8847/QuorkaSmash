import { CONFIG } from './config';
import { Paddle, Quorka } from './entities';

export interface CollisionResult {
  hitPaddle: boolean;
  isPerfect: boolean;
  hitOffset: number;
}

export function updatePhysics(
  dt: number,
  quorka: Quorka,
  paddle: Paddle,
  courtWidth: number,
  courtHeight: number,
  onPaddleHit: (isPerfect: boolean, hitOffset: number) => void,
  onWallBounce: (side: 'left' | 'right' | 'ceiling') => void,
  onFloorMiss: () => void
) {
  // Clamped dt to prevent tunneling on frame hitch
  const clampedDt = Math.min(dt, 0.05);

  // 1. Euler physics integration
  quorka.x += quorka.vx * clampedDt;
  quorka.y += quorka.vy * clampedDt;
  quorka.vy += CONFIG.GRAVITY * clampedDt;
  quorka.vx *= CONFIG.AIR_DRAG;
  quorka.spin += quorka.vx * 0.0035;

  const r = quorka.radius;

  // 2. Wall Collisions (Left & Right)
  if (quorka.x - r < 0) {
    quorka.x = r;
    quorka.vx = Math.abs(quorka.vx) * 0.95;
    quorka.spin += 0.4;
    onWallBounce('left');
  } else if (quorka.x + r > courtWidth) {
    quorka.x = courtWidth - r;
    quorka.vx = -Math.abs(quorka.vx) * 0.95;
    quorka.spin -= 0.4;
    onWallBounce('right');
  }

  // 3. Ceiling Collision
  if (quorka.y - r < 0) {
    quorka.y = r;
    quorka.vy = Math.abs(quorka.vy) * 0.92;
    onWallBounce('ceiling');
  }

  // 4. Floor (Miss Condition)
  if (quorka.y - r > courtHeight) {
    onFloorMiss();
    return;
  }

  // 5. Paddle ↔ Quorka Collision (Circle-to-Box test)
  if (quorka.vy > 0 && paddle.hitCooldown <= 0) {
    const pBounds = paddle.bounds;
    const closestX = Math.max(pBounds.x, Math.min(quorka.x, pBounds.x + pBounds.w));
    const closestY = Math.max(pBounds.y, Math.min(quorka.y, pBounds.y + pBounds.h));

    const dx = quorka.x - closestX;
    const dy = quorka.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < r * r) {
      // Confirmed collision with paddle!
      paddle.hitCooldown = CONFIG.HIT_COOLDOWN;
      quorka.y = pBounds.y - r;

      // Hit offset from paddle center: -1.0 (far left) to +1.0 (far right)
      const rawOffset = (quorka.x - paddle.x) / (paddle.w * 0.5);
      const hitOffset = Math.max(-1, Math.min(1, rawOffset));

      const isPerfect = Math.abs(quorka.x - paddle.x) <= CONFIG.PERFECT_CENTER_THRESHOLD;

      // Calculate horizontal bounce based on hit offset + player paddle motion
      quorka.vx = hitOffset * CONFIG.MAX_HORIZONTAL_SPEED + (paddle.vx ? paddle.vx * 0.18 : 0);

      // Upward bounce impulse scaling with combo
      const comboBoost = Math.min(quorka.combo * 14, 220);
      const targetVy = -(CONFIG.BASE_UPWARD_IMPULSE + comboBoost);
      quorka.vy = Math.max(-CONFIG.MAX_UPWARD_SPEED, targetVy);

      // Additional spin for visual juiciness
      quorka.spin += hitOffset * 1.2;

      onPaddleHit(isPerfect, hitOffset);
    }
  }
}
