import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, Share2, Check, User, Award } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { MatchStats, MatchCommentary } from '../game/types';
import { saveScore, isHighScore } from '../game/storage';

interface GameOverModalProps {
  stats: MatchStats;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onPlayAgain,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('quorkaSmash_lastPlayerName') || 'Stay';
  });
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [commentary, setCommentary] = useState<MatchCommentary | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  const qualifies = isHighScore(stats.score);

  // Trigger celebratory confetti on high score or high combo
  useEffect(() => {
    if (qualifies || stats.maxCombo >= 10) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#F59E0B', '#38BDF8', '#A855F7'],
      });
    }
  }, [qualifies, stats.maxCombo]);

  // Fetch AI Cheer Squad commentary from server
  useEffect(() => {
    let isCancelled = false;

    async function fetchCommentary() {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: stats.score,
            maxCombo: stats.maxCombo,
            hits: stats.totalHits,
            livesLost: 3 - stats.livesRemaining,
            name: playerName,
          }),
        });
        if (!res.ok) throw new Error('Failed to fetch commentary');
        const data = await res.json();
        if (!isCancelled) {
          setCommentary(data);
        }
      } catch (err) {
        console.error('Commentary error:', err);
        if (!isCancelled) {
          setCommentary({
            badgeTitle: 'Maniac Smash Prodigy',
            quote: 'You kept that Quorka soaring through the chaos! Pure Stray Kids main dancer energy on the paddle!',
            cheer: 'YOU MAKE STRAY KIDS STAY!',
            mvpMember: 'Han Jisung & Felix',
            rating: 'S-Tier Stay',
            isAiGenerated: false,
          });
        }
      } finally {
        if (!isCancelled) setLoadingAi(false);
      }
    }

    fetchCommentary();

    return () => {
      isCancelled = true;
    };
  }, [stats.score, stats.maxCombo, stats.totalHits, stats.livesRemaining, playerName]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSavedScore || !playerName.trim()) return;

    saveScore({
      name: playerName.trim(),
      score: stats.score,
      maxCombo: stats.maxCombo,
    });

    try {
      localStorage.setItem('quorkaSmash_lastPlayerName', playerName.trim());
    } catch {}

    setHasSavedScore(true);
  };

  const handleShare = async () => {
    const text = `🏓 I scored ${stats.score.toLocaleString()} points with a ${stats.maxCombo}x combo in Quorka Smash! Can you beat my Stray Kids Stay score?`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2400);
      }
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-20 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-5 sm:p-6 text-center my-auto"
      >
        {/* Header Icon */}
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl shadow-inner">
          {qualifies ? '🏆' : '🏓'}
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {qualifies ? 'HIGH SCORE!' : 'MATCH OVER'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {qualifies ? 'You made it onto the Stay Leaderboard!' : 'The Quorka broke past your paddle!'}
        </p>

        {/* Score Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Final Score
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {stats.score.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Combo</div>
              <div className="font-mono font-bold text-amber-600 text-sm">{stats.maxCombo}x</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Hits</div>
              <div className="font-mono font-bold text-slate-700 text-sm">{stats.totalHits}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sweet Spots</div>
              <div className="font-mono font-bold text-rose-600 text-sm">{stats.perfectHits}</div>
            </div>
          </div>
        </div>

        {/* AI Cheer Squad Commentary Badge */}
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-br from-rose-50/70 via-amber-50/50 to-slate-50 border border-rose-200/60 text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Stay Cheer Squad Review</span>
            </div>
            {commentary && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                {commentary.rating}
              </span>
            )}
          </div>

          {loadingAi ? (
            <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="animate-spin text-base">✦</span>
              <span>Cheer Squad is preparing your badge...</span>
            </div>
          ) : commentary ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-slate-900 text-sm">{commentary.badgeTitle}</span>
              </div>
              <p className="text-xs text-slate-600 italic mb-2 leading-relaxed">
                "{commentary.quote}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-rose-100">
                <span>
                  MVP Fan: <strong className="text-slate-800">{commentary.mvpMember}</strong>
                </span>
                <span className="font-bold text-rose-600 font-mono text-[10px]">
                  {commentary.cheer}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Leaderboard Submission Form */}
        {!hasSavedScore && (
          <form onSubmit={handleSaveScore} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={14}
                placeholder="Enter Stay Name"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              Save Score
            </button>
          </form>
        )}

        {hasSavedScore && (
          <div className="mb-4 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved to Leaderboard!</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-98 transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="py-2 px-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2 px-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Score</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
