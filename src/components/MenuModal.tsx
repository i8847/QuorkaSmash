import React from 'react';
import { Play, Trophy, Sparkles, MousePointer, Keyboard, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuModalProps {
  highScore: number;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  highScore,
  onStartGame,
  onOpenLeaderboard,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8"
      >
        {/* Animated Mascot Emblem */}
        <div className="relative inline-block mb-4">
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-200 via-rose-100 to-amber-100 border-4 border-white shadow-xl flex items-center justify-center relative"
          >
            {/* Visual Quorka Icon */}
            <span className="text-5xl sm:text-6xl select-none" role="img" aria-label="Quorka">
              🏓
            </span>
            {/* Tiny Stray Kids Lightstick Badge */}
            <div className="absolute -top-1 -right-1 bg-rose-500 text-white p-1.5 rounded-full shadow-md text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          QUORKA <span className="text-rose-600">SMASH</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
          Rally the fluffy, slightly deranged Quorka creature and keep the Stay combo alive!
        </p>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="mb-6 py-2 px-4 rounded-xl bg-amber-50 border border-amber-200/80 inline-flex items-center gap-2 text-xs font-semibold text-amber-800">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>High Score to Beat:</span>
            <span className="font-mono font-bold text-sm text-amber-900">
              {highScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onStartGame}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-98 transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 text-base sm:text-lg group"
          >
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>Smash to Start!</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>View Leaderboard</span>
          </button>
        </div>

        {/* Quick Controls Card */}
        <div className="pt-4 border-t border-slate-100 text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Controls
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
              <MousePointer className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Mouse / Touch Drag</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
              <Keyboard className="w-4 h-4 text-slate-400 shrink-0" />
              <span>A / D or Arrow Keys</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>You have 3 lives. Hit the paddle sweet spot for bonus points!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
