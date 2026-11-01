import React from 'react';
import { Heart, Pause, Play, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HUDProps {
  score: number;
  combo: number;
  lives: number;
  highScore: number;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  combo,
  lives,
  highScore,
  isPaused,
  onTogglePause,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-10">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {/* Left: Score & High Score */}
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Score
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {score.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            BEST: {highScore.toLocaleString()}
          </span>
        </div>

        {/* Center: Dynamic Combo Meter */}
        <div className="flex flex-col items-center">
          <AnimatePresence mode="popLayout">
            {combo >= 2 && (
              <motion.div
                key={combo}
                initial={{ scale: 0.7, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white shadow-lg backdrop-blur-xs"
              >
                <Flame className={`w-4 h-4 ${combo >= 10 ? 'text-amber-400 animate-bounce' : 'text-rose-400'}`} />
                <span className="font-mono text-sm sm:text-base font-black tracking-wide text-amber-300">
                  {combo}x COMBO
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Lives & Pause Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, idx) => {
              const active = idx < lives;
              return (
                <Heart
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                    active
                      ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-sm'
                      : 'text-slate-300 fill-slate-200 scale-90 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={onTogglePause}
            className="pointer-events-auto p-2 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm border border-slate-200/80 active:scale-95 transition-all"
            title={isPaused ? 'Resume Game (Space)' : 'Pause Game (Space)'}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-slate-700" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
