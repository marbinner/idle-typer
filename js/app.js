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
 * Stop the game loop
 */
function stopGameLoop() {
    isRunning = false;
    console.log('Game loop stopped');
}

/**
 * Initialize all game systems
 */
async function init() {
    console.log('Initializing Idle Typer...');

    try {
        // Initialize state system (already done on import)
        console.log('State system ready');

        // Initialize save system and load any saved game
        initSave();
        console.log('Save system ready');

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

        // Initialize stats system
        initStats();
        console.log('Stats system ready');

        // Set up auto-save interval
        setInterval(() => {
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
 * Show error message
 */
function showErrorMessage(error) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--error-red);">
                <h1>Failed to load game</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                    Reload
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.IdleTyper = {
    State,
    startGameLoop,
    stopGameLoop,
    formatNumber,
    // Debug functions - use in browser console
    debug: {
        addCoins: (amount) => {
            State.addCoins(amount, 'debug');
            console.log(`Added ${formatNumber(amount)} coins`);
        },
        setCoins: (amount) => {
            State.updateState({ coins: amount });
            console.log(`Set coins to ${formatNumber(amount)}`);
        },
        addFollowers: (amount) => {
            State.addFollowers(amount, 'debug');
            console.log(`Added ${formatNumber(amount)} followers`);
        },
        maxCoins: () => {
            State.updateState({ coins: 1e15 });
            console.log('Set coins to 1 quadrillion');
        },
        unlockAll: () => {
            State.updateState({ lifetimeCoins: 1e15 });
            console.log('Unlocked all bots (set lifetime coins to 1 quadrillion)');
        }
    }
};
