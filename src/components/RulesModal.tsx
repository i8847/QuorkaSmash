import React from 'react';
import { X, Sparkles, Target, Zap, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
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
            <HelpCircle className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900">How to Play Quorka Smash</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 space-y-3.5 flex-1 overflow-y-auto text-xs text-slate-600">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-2xl select-none">🏓</span>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Meet the Quorka</strong>
              <span>
                A cute, bouncy creature wearing tiny Stray Kids accessories (Nachimbong lightstick, stray-cat ears, and a STAY tattoo). Keep it airborne!
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Target className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Sweet Spot Power</strong>
              <span>
                Hit the Quorka with the white center zone of your paddle for a "Sweet Spot" (+150 bonus points) and crystal audio chime.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Spin & Angle Control</strong>
              <span>
                Hits toward the outer edges of the paddle steer the Quorka sharply across the court. Paddle movement adds extra horizontal velocity!
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Combos & AI Badges</strong>
              <span>
                Consecutive hits increase your combo multiplier (+30 pts per combo level). After the match, the AI Cheer Squad reviews your performance and awards a collectible badge.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Lives & Game Over</strong>
              <span>
                You start with 3 lives (hearts). If the Quorka slips beneath the baseline, you lose a heart. When all 3 are lost, the match ends.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors text-sm"
          >
            Got it, Let's Play!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
