export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'LEADERBOARD';

export interface LeaderboardEntry {
  name: string;
  score: number;
  maxCombo: number;
  date: string;
}

export interface MatchStats {
  score: number;
  maxCombo: number;
  currentCombo: number;
  totalHits: number;
  perfectHits: number;
  livesRemaining: number;
  durationSeconds: number;
}

export interface MatchCommentary {
  badgeTitle: string;
  quote: string;
  cheer: string;
  mvpMember: string;
  rating: string;
  isAiGenerated?: boolean;
}

export interface Point {
  x: number;
  y: number;
}
