export const CONFIG = {
  // Logical court dimensions
  COURT_WIDTH: 600,
  COURT_HEIGHT: 840,

  // Paddle parameters
  PADDLE_WIDTH: 130,
  PADDLE_HEIGHT: 20,
  PADDLE_Y_OFFSET: 70, // distance from bottom of court
  PADDLE_SPEED: 700, // px/s for keyboard
  FOLLOW_LERP: 0.28, // smooth cursor/touch tracking

  // Quorka ball parameters
  QUORKA_RADIUS: 28,
  INITIAL_VX: 120,
  INITIAL_VY: -480,

  // Physics constants
  GRAVITY: 890, // px/s²
  AIR_DRAG: 0.999, // horizontal damping
  BOUNCE_FACTOR: 1.025, // energy bounce factor
  BASE_UPWARD_IMPULSE: 540,
  MAX_UPWARD_SPEED: 950,
  MAX_HORIZONTAL_SPEED: 620,
  HIT_COOLDOWN: 0.16, // prevent multi-collision on single bounce

  // Scoring & Combo
  BASE_POINTS: 100,
  COMBO_BONUS: 30,
  PERFECT_CENTER_THRESHOLD: 16, // within 16px of paddle center
  PERFECT_BONUS: 150,
  MAX_LIVES: 3,

  // Visual Effects
  SCREEN_SHAKE_DECAY: 0.9,
  PARTICLE_BURST_COUNT: 18,
  POPUP_DURATION: 0.9,

  // Storage
  LEADERBOARD_KEY: 'quorkaSmash_leaderboard_v1',
  DEFAULT_PLAYER_NAME: 'Stay',
} as const;
