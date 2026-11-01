import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface PauseModalProps {
  score: number;
  combo: number;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  combo,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
          <span className="text-xl">⏸</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Game Paused</h3>
        <p className="text-xs text-slate-500 mb-4">Take a breather, Stay! Catch your breath.</p>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 mb-5">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Current Score</div>
            <div className="font-mono text-lg font-bold text-slate-800">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Streak</div>
            <div className="font-mono text-lg font-bold text-amber-600">{combo}x Combo</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume (Space)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Game</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2 px-4 rounded-xl font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
