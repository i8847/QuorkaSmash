# Quorka Smash: Browser Table-Tennis Arcade Game

A fast-paced, cute, and chaotic single-player browser table-tennis arcade game where players rally a fluffy, slightly deranged "Quorka" creature wearing Stray Kids-inspired accessories, featuring real-time 2D physics, procedural Web Audio SFX, local high-score leaderboards, and AI match hype commentary.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during the interactive clarification phase:

- **Confirmed Mode & Lives**: Classic Arcade mode featuring 3 lives, consecutive hit combo multipliers, and score scaling.
- **Confirmed Audio Engine**: Browser Web Audio API procedural synthesizer providing pitch-shifting boops, wall ticks, life-loss drop tones, and celebratory combo fanfare without external audio asset dependencies.
- **Confirmed AI Feature**: Server-side Gemini AI match commentator (`gemini-3.8-flash`) that generates witty Stray Kids-themed match recap commentary and personalized achievement badges based on the player's score and max combo.

---

## 1. Overview & Core Concept

- **What It Does**: "Quorka Smash" challenges players to keep a bouncy, animated Quorka in play using a responsive paddle. Every hit builds a combo multiplier, increases rally intensity, and triggers dynamic particles (hearts, stars, and compass lightstick sparks). If the Quorka slips past the paddle, a life is lost. After the match, players can record their high scores to the local top 10 leaderboard and receive an AI-generated hype badge and cheer review.
- **Target Audience / Persona**: Casual browser gamers, arcade enthusiasts, and Stray Kids fans looking for a humorous, satisfying, and responsive mini-game.
- **Key Value**: Instant zero-friction playability across desktop and mobile touch devices, 60 FPS physics, tactile audio feedback, and charming visual personality.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Title & Start Screen**:
   - Clean, playful game arena showcase.
   - High-contrast start action, how-to-play guide, audio toggle, and leaderboard view.
2. **Active Gameplay (Rally & Smash)**:
   - Paddle moves smoothly following mouse cursor, touch drag, or keyboard arrows (`A`/`D` / `←`/`→`).
   - Quorka bounces off walls, ceiling, and the player paddle with physics-based hit offsets (hitting edges angles the ball horizontally).
   - Real-time HUD displays current score, combo streak, lives (3 hearts), and current session high score.
   - Screen shake, hit flash, and floating point popups reward clean returns.
   - Pressing `Space` or the pause button brings up an unobtrusive pause overlay.
3. **Round Summary & Game Over**:
   - Displays final score, maximum combo reached, and rank.
   - Name input prompt for local leaderboard if qualifying for Top 10.
   - Gemini AI Hype Commentary card generating custom Stay-themed badges (e.g., "Thunderous Smack Master", "God's Menu Rally Prodigy").
   - Instant single-click "Play Again" button with instant state reset.
4. **Leaderboard & Records**:
   - Top 10 entries with rank, player name, score, max combo, and date.
   - Option to clear scores with confirmation dialog.

### Visual Identity & Theme
- **Aesthetic Direction**: Pastel arcade pop with subtle Stray Kids easter eggs (soft lilac, cream, mint, and charcoal, with red/gold accents).
- **Color Palette (60-30-10 Budget)**:
  - Canvas Arena (60%): `#F8F9FD` soft court surface with subtle court grid lines and center dashed table-tennis line.
  - Structural Surfaces (30%): Deep slate `#1E293B` paddle with sleek rounded caps, crisp white UI dialog cards with subtle borders.
  - High-Intent Accents (10%): Energetic coral `#F43F5E` for lives/hearts, electric amber `#F59E0B` for combo sparks, and vibrant cyan `#06B6D4` for AI badges.
- **Typography & Hierarchy**:
  - Display Title: `Plus Jakarta Sans` or bold geometric sans for punchy arcade titles and combo notifications.
  - HUD & Scores: `JetBrains Mono` / tabular monospace numbers (`font-mono tabular-nums`) for jitter-free score counters.
  - UI Prose: Clean sans-serif with natural title case and zero pill enclosures on metadata.
- **Motion & Game Juice**:
  - Quorka facial expression shifts (curious, dizzy spin, ecstatic on 10+ combo).
  - Screen shake (2–4px) on high-speed paddle impacts.
  - Particle burst effects with randomized lifetime and gravity.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: HTML5 2D Canvas with Dedicated Entity Pipeline**
  - *Chosen Approach*: Pure `<canvas>` rendering loop with fixed-timestep physics and sub-pixel interpolation.
  - *Why*: Eliminates DOM reflow overhead, guarantees solid 60 FPS performance across desktop and mobile, and gives pixel-perfect collision detection.
  - *Alternatives Considered*: React DOM elements with CSS animations (poor collision precision, jank at high speeds).
- **Decision 2: Procedural Web Audio API vs. Static MP3s**
  - *Chosen Approach*: Native Web Audio API oscillator nodes for paddle hits, wall bounces, life loss, and fanfare arpeggios.
  - *Why*: Zero loading latency, no broken audio asset paths, dynamic frequency shifts mapped directly to combo streaks.
  - *Alternatives Considered*: Bundled audio files (susceptible to loading delays and browser autoplay blocks).
- **Decision 3: Server-Side Gemini AI Cheer Squad**
  - *Chosen Approach*: Dedicated server proxy route (`/api/commentary`) using `@google/genai` and `gemini-3.8-flash` with structured JSON schema output, falling back gracefully to offline cheer templates if offline or missing API key.
  - *Why*: Secure key handling, zero client key leakage, fast response times, and resilience against offline play.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│                                                             │
│  ┌───────────────────────┐       ┌──────────────────────┐  │
│  │   Input Controller    │       │   Web Audio Engine   │  │
│  │ (Pointer / Keyboard)  │       │ (Oscillators / Gain) │  │
│  └───────────┬───────────┘       └──────────▲───────────┘  │
│              │                              │               │
│              ▼                              │               │
│  ┌──────────────────────────────────────────┴────────────┐  │
│  │                  Game Engine & Loop                   │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │  │
│  │  │ Paddle Entity │ │ Quorka Entity │ │  Particles   │ │  │
│  │  └───────────────┘ └───────────────┘ └──────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │   Physics & Collision (AABB / Circle Reflection) │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │   State Machine (MENU | PLAY | PAUSE | GAMEOVER) │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│              ┌──────────────┴──────────────┐                │
│              ▼                             ▼                │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ HTML5 2D Canvas View  │   │  Leaderboard LocalStorage │  │
│  │ (High-DPI Scaled)     │   │  (Top 10 High Scores)     │  │
│  └───────────────────────┘   └───────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ POST /api/commentary
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Node / Express Server                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  /api/commentary Handler                              │  │
│  │  Calls @google/genai (model: gemini-3.8-flash)        │  │
│  │  System: Stray Kids cheer squad commentator           │  │
│  │  Output: Structured JSON (badgeTitle, quote, cheer)   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Models & Local Storage Schema
- **Leaderboard Entry**:
  ```typescript
  interface LeaderboardEntry {
    name: string;
    score: number;
    maxCombo: number;
    date: string;
  }
  ```
- **Commentary Badge Schema**:
  ```typescript
  interface MatchCommentary {
    badgeTitle: string;
    quote: string;
    hypeCheer: string;
    energyRating: number;
  }
  ```

### Verification & Testing Plan
1. **Compilation & Linting**: Verify clean TypeScript types, no missing dependencies, and zero build errors with `compile_applet`.
2. **Physics & Collision Validation**: Test paddle edge deflections, wall ricochets, ceiling bounces, and floor miss detection.
3. **Audio Check**: Test Web Audio initialization on user interaction (resolving browser AudioContext suspension).
4. **Input Testing**: Validate mouse follow, touch dragging on mobile viewports, and keyboard controls.
5. **Persistence**: Test leaderboard addition, top 10 sorting, and persistence across browser refreshes.
6. **AI Fallback**: Verify AI commentator displays fallback badges seamlessly if server endpoint is loading or in offline mode.
