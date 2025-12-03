# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

```bash
# Start local server
python -m http.server 8080

# Visit http://localhost:8080
```

No build step required - this is a vanilla JavaScript project using ES6 modules.

## Architecture

**Shitpost Hero** is an idle typing game where players type posts to earn coins and followers, purchase bots for passive income, and progress through ranks.

### Entry Point
- `index.html` - Single-page app with all UI structure
- `js/app.js` - Main entry point, initializes all systems and runs the game loop (60fps fixed timestep)

### Core Systems (in `js/`)

| File | Purpose |
|------|---------|
| `state.js` | Central state management with pub/sub pattern. All game data flows through here via `getState()`, `updateState()`, and `subscribe()` |
| `config.js` | All game balance tuning knobs (bot costs, typing rewards, viral chances, etc.) |
| `utils.js` | Formatting functions for numbers, coins (μ₿/₿), durations. Currency displays as μ₿ (micro-bitcoin) |

### Modules (in `js/modules/`)

| Module | Purpose |
|--------|---------|
| `typing.js` | Keyboard input handling, post completion, WPM tracking, golden characters, viral detection |
| `upgrades.js` | Shop UI, bot/upgrade purchases, tab switching |
| `idle.js` | Passive income tick (bots generate coins per second) |
| `particles.js` | Canvas-based particle effects with object pooling |
| `ui.js` | DOM updates, stats display, heat meter |
| `save.js` | LocalStorage persistence, auto-save every 30s |
| `achievements.js` | Achievement tracking and unlocks |
| `events.js` | Random game events (2x coins, viral hour, etc.) |
| `sound.js` | Audio feedback for typing and rewards |
| `stats.js` | Statistics panel data |
| `bickering.js` | Twitter argument mini-game challenge system |
| `gambling.js` | Crypto trading/gambling mini-game with spin wheel |
| `monsters.js` | Monster spawning mini-game (type to defeat) |
| `newsTicker.js` | Dynamic news feed reactions about player, username prompt |
| `dailyStreak.js` | Daily login streak system with multiplier bonuses |
| `quests.js` | Rotating quest/mission system with rewards |

### Data (in `js/data/`)

| File | Purpose |
|------|---------|
| `upgrades.js` | Bot definitions (150 bots across 10 tiers) with formula-based cost/CPS generation |
| `posts.js` | Aggregates post content from batch files |
| `posts_batch_*.js` | Post content split into batches |
| `achievements.js` | Achievement definitions |
| `bickering.js` | Twitter argument conversations (40 conversations across 4 categories) |

### State Flow
1. User types → `typing.js` validates input
2. Post completion → `state.js` updates coins/followers via `addCoins()`, `addFollowers()`
3. State change → triggers `recalculateDerived()` for CPS/multipliers
4. Subscribers notified → UI updates via `subscribe()` callbacks

### Key Mechanics
- **Coins (μ₿)**: Primary currency, earned from typing and bots
- **Followers**: Passive multiplier using sqrt scaling (`1 + sqrt(followers)/30`)
- **Bots**: 150 bots in 10 tiers with triangular CPS scaling (`n*(n+1)/2`)
- **Tier upgrades**: Unique bonuses per tier (typing boost, bot discount, etc.)
- **Viral posts**: Tiered random events (mini-viral → main character)
- **Heat meter**: Typing speed visualization with adaptive calibration
- **Bickering challenges**: Random Twitter argument mini-games (8% chance after posts, 60s cooldown)

### Bickering Challenge System
The bickering system (`js/modules/bickering.js`) is a typing mini-game where players argue with random Twitter opponents:
- **Trigger**: 8% chance after post completion (requires 15+ lifetime posts, 60s cooldown)
- **Flow**: Type 3 replies to win the argument, opponent responds after each
- **Rewards**: 5x base post reward, scaled by difficulty/accuracy/speed
- **Categories**: tech, popculture, internet, lifestyle (40 total conversations)
- **Event**: Emits `bickering-ended` custom event when challenge completes

### Custom Events
The game dispatches these custom events on `window`:
- `coins-gained` - `{ amount, source, total }`
- `followers-gained` - `{ amount, source, total }`
- `bickering-ended` - When a bickering challenge completes
- `cps-milestone` - `{ milestone, cps }` - When CPS crosses a threshold
- `follower-milestone` - `{ milestone, total }` - When followers cross a threshold
- `post-milestone` - `{ milestone, total }` - When lifetime posts cross a threshold

### Debug/Testing Utilities
Available in browser console:
- `window.cheat.coins(amount)` - Add coins (default 100000)
- `window.cheat.followers(amount)` - Add followers (default 1000)
- `window.cheat.reset()` - Reset game and reload
- `window.testBickering(category?)` - Trigger bickering challenge (optionally by category)
- `window.IdleTyperEvents.triggerEvent(eventName)` - Manually trigger game events
- `window.IdleTyperEvents.getActiveEvents()` - List active events
- `window.IdleTyperEvents.spawnFloatingBonus()` - Spawn the clickable bonus

### CSS Structure
- `css/theme.css` - CSS custom properties (colors, spacing)
- `css/main.css` - Layout and components
- `css/animations.css` - Keyframe animations
