/**
 * Feature Unlock System
 * Manages progressive introduction of game features to avoid overwhelming new players
 */

import * as State from '../state.js';
import { playSound } from './sound.js';
import { spawnParticles, screenFlash } from './particles.js';

// Feature definitions with unlock conditions and UI elements
// Order matters - features unlock in this sequence when conditions are met
export const FEATURES = {
    // === EARLY GAME (Posts 1-15) ===
    combo: {
        id: 'combo',
        name: 'Combo System',
        description: 'Chain correct keystrokes to build combos for bonus coins!',
        icon: '🔥',
        unlockCondition: { posts: 3 },
        uiElements: ['#combo-display'],
        tip: 'Keep typing without errors to build your combo multiplier.'
    },
    perfectBonus: {
        id: 'perfectBonus',
        name: 'Perfect Posts',
        description: 'Complete posts with 0 errors for bonus coins and followers!',
        icon: '💯',
        unlockCondition: { posts: 10 },
        uiElements: [],
        tip: 'Type carefully to earn the Perfect Bonus on every post.'
    },
    criticalHits: {
        id: 'criticalHits',
        name: 'Critical Hits',
        description: 'Random keystrokes can now trigger critical hits for massive bonuses!',
        icon: '⚡',
        unlockCondition: { posts: 15 },
        uiElements: [],
        tip: 'Crits happen randomly. Build combos to increase your crit chance!'
    },

    // === EARLY-MID GAME (Posts 16-30) ===
    balloonPop: {
        id: 'balloonPop',
        name: 'Balloon Bonus',
        description: 'A balloon appears! Fill it with posts for a big bonus when it pops!',
        icon: '🎈',
        unlockCondition: { posts: 20 },
        uiElements: ['#balloon-container'],
        tip: 'Post regularly to inflate the balloon. It pops every 8-12 posts!'
    },
    wpmBonus: {
        id: 'wpmBonus',
        name: 'Speed Bonuses',
        description: 'Type faster to earn speed bonus multipliers!',
        icon: '⏱️',
        unlockCondition: { posts: 25 },
        uiElements: [],
        tip: 'QUICK at 60 WPM, FAST at 80 WPM, SPEED DEMON at 100+ WPM!'
    },
    goldenChars: {
        id: 'goldenChars',
        name: 'Golden Characters',
        description: 'Golden letters appear in your posts! Hit them for instant coin bonuses!',
        icon: '✨',
        unlockCondition: { posts: 30 },
        uiElements: [],
        tip: 'Golden characters give you instant coins equal to 1.5 seconds of passive income.'
    },

    // === MID GAME (Posts 31-50) ===
    frenzyMode: {
        id: 'frenzyMode',
        name: 'Frenzy Mode',
        description: 'Fill the Frenzy meter by typing fast! Activate it for 3x coins!',
        icon: '🌟',
        unlockCondition: { posts: 40 },
        uiElements: ['#frenzy-container'],
        tip: 'Type quickly to fill the meter. When full, you get 15 seconds of 3x coins!'
    },
    viralPosts: {
        id: 'viralPosts',
        name: 'Viral Posts',
        description: 'Your posts can now go viral for massive coin and impression bonuses!',
        icon: '🚀',
        unlockCondition: { posts: 50 },
        uiElements: [],
        tip: 'Perfect posts have higher viral chances. Main Character status is legendary!'
    },
    streakBonus: {
        id: 'streakBonus',
        name: 'Streak Bonus',
        description: 'Complete consecutive posts for stacking streak bonuses!',
        icon: '🔗',
        unlockCondition: { posts: 50 },
        uiElements: [],
        tip: 'Each consecutive post adds +5% bonus, up to 2x multiplier!'
    },

    // === MID-LATE GAME (Posts 51-100) ===
    randomEvents: {
        id: 'randomEvents',
        name: 'Random Events',
        description: 'Special events can now trigger while you play!',
        icon: '🎲',
        unlockCondition: { posts: 75 },
        uiElements: [],
        tip: 'Events like "Elon is Watching" give temporary bonuses. Keep typing!'
    },
    personalBest: {
        id: 'personalBest',
        name: 'Personal Best Bonus',
        description: 'Beat your WPM record for bonus rewards!',
        icon: '🏆',
        unlockCondition: { posts: 75 },
        uiElements: [],
        tip: 'Breaking your personal best WPM gives 1.5x coins and 3x followers!'
    },
    floatingBonus: {
        id: 'floatingBonus',
        name: 'Floating Bonuses',
        description: 'Clickable bonuses now appear! Click them for 5x bonus mode!',
        icon: '🎁',
        unlockCondition: { posts: 100 },
        uiElements: [],
        tip: 'Click the floating bonus before it disappears for 2 minutes of 5x earnings!'
    },

    // === SHOP TABS (Coin-based, unlock progressively) ===
    upgradesTab: {
        id: 'upgradesTab',
        name: 'Upgrades Tab',
        description: 'Upgrade your abilities for permanent bonuses!',
        icon: '⚡',
        unlockCondition: { lifetimeCoins: 500 },
        uiElements: [],
        showTab: 'upgrades',
        tip: 'Upgrades provide permanent multipliers to your earnings.'
    },
    premiumTab: {
        id: 'premiumTab',
        name: 'Premium Tiers',
        description: 'Unlock verification badges and tier bonuses!',
        icon: '✓',
        unlockCondition: { lifetimeCoins: 5000 },
        uiElements: [],
        showTab: 'premium',
        tip: 'Each tier gives unique bonuses. Collect them all!'
    },
    marketTab: {
        id: 'marketTab',
        name: 'Market',
        description: 'Spin the wheel and trade crypto for big rewards!',
        icon: '📈',
        unlockCondition: { lifetimeCoins: 10000 },
        uiElements: [],
        showTab: 'market',
        tip: 'Daily spins are free! Crypto trading is risky but rewarding.'
    },

    // === MINI-GAMES ===
    monsters: {
        id: 'monsters',
        name: 'Monster Attacks',
        description: 'Monsters appear! Click them to defeat them and earn coins!',
        icon: '👹',
        unlockCondition: { posts: 35 },
        uiElements: ['#monster-container'],
        tip: 'Click monsters repeatedly to defeat them before they flee!'
    },
    bickering: {
        id: 'bickering',
        name: 'Twitter Beef',
        description: 'Random arguments challenge you to type fast!',
        icon: '⚔️',
        unlockCondition: { posts: 15 },
        uiElements: [],
        tip: 'Win arguments by typing all 3 replies quickly and accurately!'
    },

    // === SYSTEMS ===
    quests: {
        id: 'quests',
        name: 'Daily Quests',
        description: 'Complete quests for bonus rewards!',
        icon: '📜',
        unlockCondition: { posts: 8 },
        uiElements: [], // Quest panel is dynamically created
        tip: 'Quests refresh every 4 hours. Complete them for coins and followers!'
    },
    botArmy: {
        id: 'botArmy',
        name: 'Bot Army Display',
        description: 'See your army of bots working for you!',
        icon: '🤖',
        unlockCondition: { lifetimeCoins: 25 },
        uiElements: ['#bot-army-display'],
        tip: 'Your bots work 24/7 generating coins even when you\'re not typing.'
    }
};

// Unlock queue - features waiting to be shown to user
let unlockQueue = [];
let isShowingUnlock = false;
let unlockOverlay = null;

// Track which tabs should be visible
const visibleTabs = new Set(['bots']); // Bots always visible once panel unlocks

/**
 * Initialize the unlock system
 */
export function initUnlocks() {
    // Create unlock notification overlay
    createUnlockOverlay();

    // Apply initial visibility based on saved state
    applyUnlockVisibility();

    // Subscribe to state changes to check for new unlocks
    State.subscribe(checkForUnlocks);

    // Initial check
    checkForUnlocks();

    console.log('Unlock system initialized');
}

/**
 * Create the unlock notification overlay
 */
function createUnlockOverlay() {
    unlockOverlay = document.getElementById('unlock-overlay');
    if (!unlockOverlay) {
        unlockOverlay = document.createElement('div');
        unlockOverlay.id = 'unlock-overlay';
        unlockOverlay.className = 'unlock-overlay hidden';
        unlockOverlay.innerHTML = `
            <div class="unlock-modal">
                <div class="unlock-header">
                    <span class="unlock-badge">NEW FEATURE</span>
                </div>
                <div class="unlock-icon"></div>
                <h2 class="unlock-title"></h2>
                <p class="unlock-description"></p>
                <div class="unlock-tip"></div>
                <button class="unlock-btn">Got it!</button>
            </div>
        `;
        document.body.appendChild(unlockOverlay);

        // Add click handler
        unlockOverlay.querySelector('.unlock-btn').addEventListener('click', dismissUnlock);
        unlockOverlay.addEventListener('click', (e) => {
            if (e.target === unlockOverlay) dismissUnlock();
        });
    }
}

/**
 * Check if any new features should be unlocked
 */
function checkForUnlocks() {
    const state = State.getState();
    const unlockedFeatures = state.unlockedFeatures || {};

    for (const [featureId, feature] of Object.entries(FEATURES)) {
        // Skip already unlocked features
        if (unlockedFeatures[featureId]) continue;

        // Check unlock condition
        const condition = feature.unlockCondition;
        let shouldUnlock = false;

        if (condition.posts !== undefined && state.lifetimePosts >= condition.posts) {
            shouldUnlock = true;
        }
        if (condition.coins !== undefined && state.coins >= condition.coins) {
            shouldUnlock = true;
        }
        if (condition.lifetimeCoins !== undefined && state.lifetimeCoins >= condition.lifetimeCoins) {
            shouldUnlock = true;
        }
        if (condition.followers !== undefined && state.followers >= condition.followers) {
            shouldUnlock = true;
        }

        if (shouldUnlock) {
            queueUnlock(featureId);
        }
    }
}

/**
 * Queue a feature unlock notification
 */
function queueUnlock(featureId) {
    const feature = FEATURES[featureId];
    if (!feature) return;

    // Mark as unlocked in state immediately
    const state = State.getState();
    const unlockedFeatures = { ...(state.unlockedFeatures || {}), [featureId]: true };
    State.updateState({ unlockedFeatures }, true);

    // Add to queue
    unlockQueue.push(featureId);

    // Show UI elements for this feature
    showFeatureUI(featureId);

    // Process queue if not already showing
    if (!isShowingUnlock) {
        processUnlockQueue();
    }
}

/**
 * Process the unlock queue
 */
function processUnlockQueue() {
    if (unlockQueue.length === 0) {
        isShowingUnlock = false;
        return;
    }

    isShowingUnlock = true;
    const featureId = unlockQueue.shift();
    showUnlockNotification(featureId);
}

/**
 * Show unlock notification for a feature
 */
function showUnlockNotification(featureId) {
    const feature = FEATURES[featureId];
    if (!feature || !unlockOverlay) return;

    // Play unlock sound
    playSound('premium');

    // Visual effects
    screenFlash('gold');
    spawnParticles('confetti', window.innerWidth / 2, window.innerHeight / 2, 30);

    // Update modal content
    unlockOverlay.querySelector('.unlock-icon').textContent = feature.icon;
    unlockOverlay.querySelector('.unlock-title').textContent = feature.name;
    unlockOverlay.querySelector('.unlock-description').textContent = feature.description;
    unlockOverlay.querySelector('.unlock-tip').textContent = '💡 ' + feature.tip;

    // Show overlay
    unlockOverlay.classList.remove('hidden');

    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('feature-unlocked', {
        detail: { featureId, feature }
    }));
}

/**
 * Dismiss current unlock notification
 */
function dismissUnlock() {
    if (!unlockOverlay) return;

    unlockOverlay.classList.add('hidden');
    playSound('complete');

    // Process next in queue after a short delay
    setTimeout(() => {
        processUnlockQueue();
    }, 500);
}

/**
 * Show UI elements for a feature
 */
function showFeatureUI(featureId) {
    const feature = FEATURES[featureId];
    if (!feature) return;

    // Show associated UI elements
    if (feature.uiElements) {
        feature.uiElements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.classList.remove('feature-locked');
                el.classList.add('feature-unlocked');
            }
        });
    }

    // Handle tab visibility
    if (feature.showTab) {
        visibleTabs.add(feature.showTab);
        updateTabVisibility();
    }
}

/**
 * Apply visibility based on current unlock state
 */
function applyUnlockVisibility() {
    const state = State.getState();
    const unlockedFeatures = state.unlockedFeatures || {};

    // Apply visibility to all lockable elements
    Object.values(FEATURES).forEach(feature => {
        if (feature.uiElements) {
            feature.uiElements.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    if (unlockedFeatures[feature.id]) {
                        // Feature is unlocked - show it
                        el.classList.remove('feature-locked');
                        el.classList.add('feature-unlocked');
                    } else {
                        // Feature is locked - hide it
                        el.classList.add('feature-locked');
                        el.classList.remove('feature-unlocked');
                    }
                }
            });
        }

        // Track visible tabs
        if (feature.showTab && unlockedFeatures[feature.id]) {
            visibleTabs.add(feature.showTab);
        }
    });

    updateTabVisibility();
}

/**
 * Update tab visibility
 */
function updateTabVisibility() {
    const tabs = document.querySelectorAll('.panel-tabs .tab');
    tabs.forEach(tab => {
        const tabId = tab.dataset.tab;
        if (visibleTabs.has(tabId)) {
            tab.classList.remove('tab-locked');
            tab.removeAttribute('disabled');
        } else {
            tab.classList.add('tab-locked');
            tab.setAttribute('disabled', 'true');
        }
    });
}

/**
 * Check if a feature is unlocked
 */
export function isFeatureUnlocked(featureId) {
    const state = State.getState();
    const unlockedFeatures = state.unlockedFeatures || {};
    return !!unlockedFeatures[featureId];
}

/**
 * Get unlock progress for a feature
 */
export function getUnlockProgress(featureId) {
    const feature = FEATURES[featureId];
    if (!feature) return { progress: 0, required: 0, type: 'unknown' };

    const state = State.getState();
    const condition = feature.unlockCondition;

    if (condition.posts !== undefined) {
        return {
            progress: state.lifetimePosts,
            required: condition.posts,
            type: 'posts'
        };
    }
    if (condition.coins !== undefined) {
        return {
            progress: state.coins,
            required: condition.coins,
            type: 'coins'
        };
    }
    if (condition.lifetimeCoins !== undefined) {
        return {
            progress: state.lifetimeCoins,
            required: condition.lifetimeCoins,
            type: 'lifetime coins'
        };
    }

    return { progress: 0, required: 0, type: 'unknown' };
}

/**
 * Get all locked features
 */
export function getLockedFeatures() {
    const state = State.getState();
    const unlockedFeatures = state.unlockedFeatures || {};

    return Object.entries(FEATURES)
        .filter(([id]) => !unlockedFeatures[id])
        .map(([id, feature]) => ({
            id,
            ...feature,
            progress: getUnlockProgress(id)
        }));
}

/**
 * Reset unlocks (for new game)
 */
export function resetUnlocks() {
    unlockQueue = [];
    isShowingUnlock = false;
    visibleTabs.clear();
    visibleTabs.add('bots');
}
