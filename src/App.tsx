import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG } from './game/config';
import { GameState, MatchStats } from './game/types';
import { Paddle, Quorka, Particle, ScorePopup } from './game/entities';
import { updatePhysics } from './game/physics';
import { drawCourt } from './game/courtRenderer';
import { soundManager } from './game/audio';
import { loadLeaderboard } from './game/storage';

import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { MenuModal } from './components/MenuModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RulesModal } from './components/RulesModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level UI and Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted());

  // In-Game Live HUD Stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState<number>(CONFIG.MAX_LIVES);
  const [highScore, setHighScore] = useState<number>(() => {
    const list = loadLeaderboard();
    return list.length > 0 ? list[0].score : 0;
  });

  // Match Summary Stats (captured on game over)
  const [matchStats, setMatchStats] = useState<MatchStats>({
    score: 0,
    maxCombo: 0,
    currentCombo: 0,
    totalHits: 0,
    perfectHits: 0,
    livesRemaining: CONFIG.MAX_LIVES,
    durationSeconds: 0,
  });

  // Mutable Game Loop State in Refs (to avoid closures in requestAnimationFrame)
  const gameRef = useRef<{
    paddle: Paddle;
    quorka: Quorka;
    particles: Particle[];
    popups: ScorePopup[];
    score: number;
    combo: number;
    maxCombo: number;
    totalHits: number;
    perfectHits: number;
    lives: number;
    shake: number;
    matchStartTime: number;
    keys: { left: boolean; right: boolean };
    lastTime: number;
    gameState: GameState;
  }>({
    paddle: new Paddle(CONFIG.COURT_WIDTH / 2, CONFIG.COURT_HEIGHT - CONFIG.PADDLE_Y_OFFSET),
    quorka: new Quorka(CONFIG.COURT_WIDTH / 2, 220),
    particles: [],
    popups: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    totalHits: 0,
    perfectHits: 0,
    lives: CONFIG.MAX_LIVES,
    shake: 0,
    matchStartTime: Date.now(),
    keys: { left: false, right: false },
    lastTime: 0,
    gameState: 'MENU',
  });

  // Keep ref state in sync with React state
  useEffect(() => {
    gameRef.current.gameState = gameState;
  }, [gameState]);

  // Start / Reset Match
  const startMatch = useCallback(() => {
    const g = gameRef.current;
    g.paddle.x = CONFIG.COURT_WIDTH / 2;
    g.paddle.targetX = CONFIG.COURT_WIDTH / 2;
    g.quorka.x = CONFIG.COURT_WIDTH / 2;
    g.quorka.y = 220;
    g.quorka.vx = (Math.random() > 0.5 ? 1 : -1) * (CONFIG.INITIAL_VX + Math.random() * 40);
    g.quorka.vy = CONFIG.INITIAL_VY;
    g.quorka.combo = 0;
    g.quorka.spin = 0;
    g.particles = [];
    g.popups = [];
    g.score = 0;
    g.combo = 0;
    g.maxCombo = 0;
    g.totalHits = 0;
    g.perfectHits = 0;
    g.lives = CONFIG.MAX_LIVES;
    g.shake = 0;
    g.matchStartTime = Date.now();

    setScore(0);
    setCombo(0);
    setLives(CONFIG.MAX_LIVES);
    setGameState('PLAYING');
    setShowRulesModal(false);
    setShowLeaderboardModal(false);
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          e.preventDefault();
          togglePause();
        }
      } else if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause]);

  // Auto-pause when tab changes / window blurs
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gameRef.current.gameState === 'PLAYING') {
        setGameState('PAUSED');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Pointer event tracking on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.COURT_WIDTH / rect.width;
    const clientX = e.clientX - rect.left;
    gameRef.current.paddle.targetX = clientX * scaleX;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.COURT_WIDTH / rect.width;
    const clientX = e.clientX - rect.left;
    gameRef.current.paddle.targetX = clientX * scaleX;

    if (gameState === 'MENU') {
      startMatch();
    }
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (timestamp: number) => {
      const g = gameRef.current;
      if (!g.lastTime) g.lastTime = timestamp;
      const dt = Math.min((timestamp - g.lastTime) / 1000, 0.05);
      g.lastTime = timestamp;

      // Handle keyboard movement if active
      if (g.gameState === 'PLAYING') {
        if (g.keys.left) {
          g.paddle.targetX -= CONFIG.PADDLE_SPEED * dt;
        }
        if (g.keys.right) {
          g.paddle.targetX += CONFIG.PADDLE_SPEED * dt;
        }

        // Update entities
        g.paddle.update(dt, CONFIG.COURT_WIDTH);
        g.quorka.update(dt);

        // Run Physics & Collision
        updatePhysics(
          dt,
          g.quorka,
          g.paddle,
          CONFIG.COURT_WIDTH,
          CONFIG.COURT_HEIGHT,
          // onPaddleHit
          (isPerfect: boolean) => {
            g.totalHits++;
            g.combo++;
            if (isPerfect) g.perfectHits++;
            if (g.combo > g.maxCombo) g.maxCombo = g.combo;

            g.quorka.combo = g.combo;
            g.quorka.hitFlash = 0.16;

            // Score calculation
            const hitPoints =
              CONFIG.BASE_POINTS +
              g.combo * CONFIG.COMBO_BONUS +
              (isPerfect ? CONFIG.PERFECT_BONUS : 0);
            g.score += hitPoints;

            // Screen shake
            g.shake = isPerfect ? 6 : 3.5;

            // Audio trigger
            soundManager.playHit(g.combo, isPerfect);
            if (g.combo % 5 === 0) {
              soundManager.playComboFanfare(g.combo);
            }

            // Spawn Particles
            const particleCount = isPerfect ? 24 : 14;
            const colors = ['#F43F5E', '#F59E0B', '#38BDF8', '#FB7185', '#FBBF24'];
            for (let i = 0; i < particleCount; i++) {
              const color = colors[Math.floor(Math.random() * colors.length)];
              const type = isPerfect ? 'star' : Math.random() > 0.4 ? 'heart' : 'spark';
              g.particles.push(new Particle(g.quorka.x, g.quorka.y, color, type));
            }

            // Score popup text
            const popupText = `+${hitPoints}`;
            const subtext = isPerfect ? 'SWEET SPOT!' : g.combo >= 5 ? `${g.combo}x COMBO` : undefined;
            g.popups.push(
              new ScorePopup(
                g.quorka.x,
                g.paddle.y - 28,
                popupText,
                isPerfect ? '#F59E0B' : '#E11D48',
                subtext
              )
            );

            // Sync with React HUD
            setScore(g.score);
            setCombo(g.combo);
          },
          // onWallBounce
          () => {
            soundManager.playWallBounce();
            // Tiny spark particles at wall impact
            for (let i = 0; i < 4; i++) {
              g.particles.push(new Particle(g.quorka.x, g.quorka.y, '#94A3B8', 'spark'));
            }
          },
          // onFloorMiss
          () => {
            soundManager.playMiss();
            g.lives--;
            g.combo = 0;
            g.quorka.combo = 0;
            setCombo(0);
            setLives(g.lives);

            // Check Game Over
            if (g.lives <= 0) {
              soundManager.playGameOver();
              g.gameState = 'GAMEOVER';
              setGameState('GAMEOVER');

              // Update High Score if needed
              if (g.score > highScore) {
                setHighScore(g.score);
              }

              // Save Match Stats for Summary
              setMatchStats({
                score: g.score,
                maxCombo: g.maxCombo,
                currentCombo: 0,
                totalHits: g.totalHits,
                perfectHits: g.perfectHits,
                livesRemaining: 0,
                durationSeconds: Math.floor((Date.now() - g.matchStartTime) / 1000),
              });
            } else {
              // Reset Quorka position to upper court
              g.quorka.x = CONFIG.COURT_WIDTH / 2;
              g.quorka.y = 160;
              g.quorka.vx = (Math.random() - 0.5) * 160;
              g.quorka.vy = 260;
              g.quorka.spin = 0;
              g.quorka.trail = [];
            }
          }
        );
      }

      // Update particles
      g.particles = g.particles.filter((p) => p.update(dt));
      // Update popups
      g.popups = g.popups.filter((p) => p.update(dt));

      // Calculate Screen Shake
      let shakeX = 0;
      let shakeY = 0;
      if (g.shake > 0.1) {
        shakeX = (Math.random() - 0.5) * g.shake * 2;
        shakeY = (Math.random() - 0.5) * g.shake * 2;
        g.shake *= CONFIG.SCREEN_SHAKE_DECAY;
      }

      // RENDER PASS
      // 1. Draw Court Background
      drawCourt(ctx, CONFIG.COURT_WIDTH, CONFIG.COURT_HEIGHT, shakeX, shakeY);

      // 2. Draw Particles
      ctx.save();
      ctx.translate(shakeX, shakeY);
      for (const p of g.particles) {
        p.draw(ctx);
      }
      ctx.restore();

      // 3. Draw Paddle
      ctx.save();
      ctx.translate(shakeX, shakeY);
      g.paddle.draw(ctx);
      ctx.restore();

      // 4. Draw Quorka
      ctx.save();
      ctx.translate(shakeX, shakeY);
      g.quorka.draw(ctx);
      ctx.restore();

      // 5. Draw Score Popups
      ctx.save();
      ctx.translate(shakeX, shakeY);
      for (const popup of g.popups) {
        popup.draw(ctx);
      }
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [highScore]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-900 select-none overflow-hidden">
      {/* Universal Top Bar */}
      <Header
        gameState={gameState}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onRestart={startMatch}
      />

      {/* Main Game Court Container */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 relative overflow-hidden">
        {/* Responsive Canvas Frame */}
        <div className="relative w-full max-w-[540px] max-h-full aspect-[600/840] shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
          <canvas
            ref={canvasRef}
            width={CONFIG.COURT_WIDTH}
            height={CONFIG.COURT_HEIGHT}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            className="w-full h-full block cursor-crosshair"
          />

          {/* In-Game HUD Overlay */}
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <HUD
              score={score}
              combo={combo}
              lives={lives}
              highScore={highScore}
              isPaused={gameState === 'PAUSED'}
              onTogglePause={togglePause}
            />
          )}

          {/* Title Screen / Main Menu Modal */}
          {gameState === 'MENU' && (
            <MenuModal
              highScore={highScore}
              onStartGame={startMatch}
              onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            />
          )}

          {/* Pause Modal */}
          {gameState === 'PAUSED' && (
            <PauseModal
              score={score}
              combo={combo}
              onResume={togglePause}
              onRestart={startMatch}
              onMainMenu={() => setGameState('MENU')}
            />
          )}

          {/* Game Over Modal */}
          {gameState === 'GAMEOVER' && (
            <GameOverModal
              stats={matchStats}
              onPlayAgain={startMatch}
              onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            />
          )}

          {/* Leaderboard Modal */}
          {showLeaderboardModal && (
            <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} />
          )}

          {/* Rules Modal */}
          {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
        </div>
      </main>
    </div>
  );
}
