import React from 'react';
import { Volume2, VolumeX, Trophy, HelpCircle, RotateCcw } from 'lucide-react';
import { GameState } from '../game/types';

interface HeaderProps {
  gameState: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onRestart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenRules,
  onRestart,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-sm z-30 shrink-0">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span className="text-xl sm:text-2xl">🏓</span>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
          QUORKA <span className="text-rose-600">SMASH</span>
        </h1>
      </div>

      {/* Zone 2: Navigation / Quick Actions */}
      <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600">
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          title="Game Rules"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">How to Play</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          title="High Scores Leaderboard"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          )}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{gameState === 'PLAYING' ? 'Restart' : 'New Game'}</span>
        </button>
      </div>
    </header>
  );
};
