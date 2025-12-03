/**
 * Idle Typer - Main Application Entry Point
 * Initializes game systems and runs the main game loop
 */

import * as State from './state.js';
import { getResetting } from './state.js';
import { OFFLINE_CONFIG, MISC_CONFIG } from './config.js';
import { formatCoins } from './utils.js';
import { initTyping, loadNewPost } from './modules/typing.js';
import { initUpgrades, renderUpgrades } from './modules/upgrades.js';
import { initUI, updateUI } from './modules/ui.js';
import { initParticles, updateParticles } from './modules/particles.js';
import { initSound } from './modules/sound.js';
import { initSave, autoSave, loadSavedPostHistory } from './modules/save.js';
import { tick } from './modules/idle.js';
import { initAchievements } from './modules/achievements.js';
import { initEvents } from './modules/events.js';
import { initStats } from './modules/stats.js';
import { initBickering } from './modules/bickering.js';
import { initGambling } from './modules/gambling.js';
import { initMonsters, tick as monsterTick } from './modules/monsters.js';
import { initNewsTicker, showUsernamePrompt } from './modules/newsTicker.js';
import { initDailyStreak } from './modules/dailyStreak.js';
import { initQuests } from './modules/quests.js';

// Game configuration
const CONFIG = {
    targetFPS: 60,
    autoSaveInterval: MISC_CONFIG.autoSaveInterval,
    tickRate: 1000 / 60 // ~16.67ms
};

// Game loop state
let lastTime = 0;
let accumulator = 0;
let isRunning = false;
let isInitialized = false;
let autoSaveIntervalId = null;

/**
 * Main game loop using requestAnimationFrame
 */
function gameLoop(currentTime) {
    if (!isRunning) return;

    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Accumulate time for fixed timestep updates
    accumulator += deltaTime;

    // Fixed timestep game logic updates
    while (accumulator >= CONFIG.tickRate) {
        // Update idle income
        tick(CONFIG.tickRate / 1000);

        // Update monster spawns and timeouts
        monsterTick(CONFIG.tickRate / 1000);

        // Update game time
        const state = State.getState();
        State.updateState({
            lastTickTime: Date.now(),
            totalPlayTime: state.totalPlayTime + CONFIG.tickRate
        }, true);

        accumulator -= CONFIG.tickRate;
    }

    // Variable timestep rendering
    updateUI();
    updateParticles(deltaTime);

    // Continue loop
    requestAnimationFrame(gameLoop);
}

/**
 * Start the game loop
 */
function startGameLoop() {
    if (isRunning) return;

    isRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    console.log('Game loop started');
}

/**
 * Initialize all game systems
 */
async function init() {
    // Prevent multiple initialization
    if (isInitialized) {
        console.warn('Game already initialized, skipping...');
        return;
    }
    isInitialized = true;

    console.log('Initializing Idle Typer...');

    try {
        // Initialize state system (already done on import)
        console.log('State system ready');

        // Initialize save system and load any saved game
        initSave();
        console.log('Save system ready');

        // Show username prompt if not set (before UI to avoid flicker)
        await showUsernamePrompt();
        console.log('Username set');

        // Initialize UI system
        initUI();
        console.log('UI system ready');

        // Initialize typing mechanic
        initTyping();
        console.log('Typing system ready');

        // Load saved post history and typing state (must be after typing init)
        const hadSavedTypingState = loadSavedPostHistory();
        console.log('Post history loaded');

        // If no saved typing state, load a new post
        if (!hadSavedTypingState) {
            loadNewPost();
        }
        console.log('Typing ready');

        // Initialize upgrades system
        initUpgrades();
        renderUpgrades();
        console.log('Upgrades system ready');

        // Initialize particle system
        initParticles();
        console.log('Particle system ready');

        // Initialize sound system
        await initSound();
        console.log('Sound system ready');

        // Initialize achievements system
        initAchievements();
        console.log('Achievements system ready');

        // Initialize events system
        initEvents();
        console.log('Events system ready');

        // Initialize news ticker (dynamic reactions about player)
        initNewsTicker();
        console.log('News ticker ready');

        // Initialize stats system
        initStats();
        console.log('Stats system ready');

        // Initialize bickering challenge system
        initBickering();
        console.log('Bickering system ready');

        // Initialize gambling/casino system
        initGambling();
        console.log('Gambling system ready');

        // Initialize monster mini-game
        initMonsters();
        console.log('Monster system ready');

        // Initialize daily streak system (shows popup on login)
        initDailyStreak();
        console.log('Daily streak system ready');

        // Initialize quest system
        initQuests();
        console.log('Quest system ready');

        // Set up auto-save interval (clear any existing interval first)
        if (autoSaveIntervalId) {
            clearInterval(autoSaveIntervalId);
        }
        autoSaveIntervalId = setInterval(() => {
            autoSave();
        }, CONFIG.autoSaveInterval);

        // Set up visibility change handling
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set up page unload handler to save game
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Initial UI update
        updateUI();

        // Start game loop
        startGameLoop();

        console.log('Idle Typer initialized successfully!');

        // Expose cheat functions for testing
        window.cheat = {
            coins: (amount = 100000) => {
                State.addCoins(amount, 'cheat');
                console.log(`Added ${amount} coins`);
            },
            followers: (amount = 1000) => {
                State.addFollowers(amount, 'cheat');
                console.log(`Added ${amount} followers`);
            },
            reset: () => {
                State.resetGame();
                location.reload();
            }
        };

        // Show welcome message
        showWelcomeMessage();

    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage(error);
    }
}

/**
 * Handle page visibility changes (tab switching)
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Tab is hidden - save current time for offline calculation
        State.updateState({ lastTickTime: Date.now() }, true);
        autoSave();
    } else {
        // Tab is visible again - calculate offline progress
        calculateOfflineProgress();
    }
}

/**
 * Handle page unload - save game before leaving
 */
function handleBeforeUnload() {
    // Don't save if we're resetting the game
    if (getResetting()) {
        console.log('Resetting - skipping autosave on unload');
        return;
    }
    // Save game state before unloading
    autoSave();
}

/**
 * Calculate progress made while tab was hidden
 */
function calculateOfflineProgress() {
    // Ensure derived values like coinsPerSecond are fresh before calculation
    State.recalculateDerived();
    const state = State.getState();
    const now = Date.now();
    const offlineTime = now - state.lastTickTime;

    // Only calculate if significant time passed (> 1 second)
    if (offlineTime > 1000) {
        const offlineSeconds = offlineTime / 1000;
        const effectiveSeconds = Math.min(offlineSeconds, OFFLINE_CONFIG.maxOfflineSeconds);

        // Apply Tier 7 offline bonus
        const offlineBonus = state.offlineBonus || 1;

        // Calculate offline earnings with configured efficiency + tier bonus
        const offlineCoins = state.coinsPerSecond * effectiveSeconds * OFFLINE_CONFIG.efficiency * offlineBonus;

        if (offlineCoins > 0) {
            State.addCoins(Math.floor(offlineCoins), 'offline');

            // Show welcome back message
            const message = formatOfflineMessage(effectiveSeconds, offlineCoins);
            showEventMessage(message, 'highlight');
        }
    }

    // Update last tick time
    State.updateState({ lastTickTime: now }, true);
}

/**
 * Format offline earnings message
 */
function formatOfflineMessage(seconds, coins) {
    const timeStr = formatDuration(seconds);
    const coinsStr = formatCoins(Math.floor(coins)).full;
    return `Welcome back! You earned ${coinsStr} while away (${timeStr})`;
}

/**
 * Format duration in human readable form
 */
function formatDuration(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

/**
 * Format large numbers
 */
function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Show welcome message on first load
 */
function showWelcomeMessage() {
    const state = State.getState();
    if (state.lifetimePosts === 0) {
        showEventMessage('Welcome to X! Start typing to gain followers...', 'normal');
    } else {
        showEventMessage(`Welcome back! You have ${formatNumber(state.followers)} followers.`, 'normal');
    }
}

/**
 * Show event message in ticker
 */
function showEventMessage(message, type = 'normal') {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
        eventText.className = type === 'highlight' ? 'highlight' : '';
    }
}

/**
 * Show error message (XSS-safe using textContent)
 */
function showErrorMessage(error) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '';

        const container = document.createElement('div');
        container.style.cssText = 'padding: 2rem; text-align: center; color: var(--error-red);';

        const heading = document.createElement('h1');
        heading.textContent = 'Failed to load game';
        container.appendChild(heading);

        const message = document.createElement('p');
        message.textContent = error.message;
        container.appendChild(message);

        const button = document.createElement('button');
        button.textContent = 'Reload';
        button.className = 'btn btn-primary';
        button.style.marginTop = '1rem';
        button.addEventListener('click', () => location.reload());
        container.appendChild(button);

        app.appendChild(container);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

