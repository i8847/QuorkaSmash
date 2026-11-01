import { CONFIG } from './config';
import { LeaderboardEntry } from './types';

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(CONFIG.LEADERBOARD_KEY);
    if (!raw) return getDefaultLeaderboard();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultLeaderboard();
  } catch (e) {
    console.error('Error loading leaderboard from localStorage:', e);
    return getDefaultLeaderboard();
  }
}

export function saveScore(entry: Omit<LeaderboardEntry, 'date'>): LeaderboardEntry[] {
  const current = loadLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    name: entry.name.trim().slice(0, 14) || CONFIG.DEFAULT_PLAYER_NAME,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  };

  const updated = [...current, newEntry];
  updated.sort((a, b) => b.score - a.score);
  const trimmed = updated.slice(0, 10);

  try {
    localStorage.setItem(CONFIG.LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save score to localStorage:', e);
  }

  return trimmed;
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(CONFIG.LEADERBOARD_KEY);
  } catch (e) {
    console.error('Failed to clear leaderboard:', e);
  }
  return [];
}

export function isHighScore(score: number): boolean {
  if (score <= 0) return false;
  const list = loadLeaderboard();
  if (list.length < 10) return true;
  return score > list[list.length - 1].score;
}

function getDefaultLeaderboard(): LeaderboardEntry[] {
  return [
    { name: 'HanQuokka', score: 4800, maxCombo: 24, date: 'Nov 1' },
    { name: 'BangChan97', score: 3950, maxCombo: 19, date: 'Nov 1' },
    { name: 'LeeKnowCats', score: 3200, maxCombo: 16, date: 'Nov 1' },
    { name: 'BbokAriFelix', score: 2750, maxCombo: 14, date: 'Nov 1' },
    { name: 'DwaekkiBin', score: 2100, maxCombo: 11, date: 'Nov 1' },
  ];
}
