import React, { useState } from 'react';
import { Trophy, Trash2, X, Medal } from 'lucide-react';
import { motion } from 'motion/react';
import { LeaderboardEntry } from '../game/types';
import { loadLeaderboard, clearLeaderboard } from '../game/storage';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const empty = clearLeaderboard();
    setEntries(empty);
    setConfirmClear(false);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-30">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-6 text-slate-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Stay Leaderboard</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-3 flex-1 overflow-y-auto space-y-1.5 min-h-[220px]">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No scores recorded yet. Play a match to claim the crown!
            </div>
          ) : (
            entries.map((item, idx) => {
              const isTop3 = idx < 3;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                    idx === 0
                      ? 'bg-amber-50/70 border border-amber-200/80 font-medium'
                      : idx === 1
                      ? 'bg-slate-50 border border-slate-200/60'
                      : idx === 2
                      ? 'bg-orange-50/50 border border-orange-200/50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-bold font-mono">
                      {idx === 0 ? (
                        <Medal className="w-4 h-4 text-amber-500 mx-auto" />
                      ) : idx === 1 ? (
                        <Medal className="w-4 h-4 text-slate-400 mx-auto" />
                      ) : idx === 2 ? (
                        <Medal className="w-4 h-4 text-amber-700 mx-auto" />
                      ) : (
                        <span className="text-slate-400">#{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>Max {item.maxCombo}x Combo</span>
                        <span>·</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                      {item.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Points</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {entries.length > 0 ? (
            <button
              onClick={handleClear}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                confirmClear
                  ? 'bg-rose-600 text-white hover:bg-rose-700 font-bold'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Click again to confirm' : 'Reset Scores'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
