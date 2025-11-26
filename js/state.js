/**
 * Central State Management with Pub/Sub Pattern
 * Single source of truth for all game data
 */

// Flag to prevent autosave during reset
let isResetting = false;

export function setResetting(value) {
    isResetting = value;
}

export function getResetting() {
    return isResetting;
}

// Initial game state
const initialState = {
    // Main currency
    coins: 0,
    lifetimeCoins: 0,

    // Followers (passive multiplier)
    followers: 0,
    lifetimeFollowers: 0,

    // Impressions (secondary stat)
    impressions: 0,
    lifetimeImpressions: 0,

    // Lifetime stats (never reset except on full wipe)
    lifetimePosts: 0,

    // Typing progress
    currentPost: null,
    typedIndex: 0,
    combo: 0,
    maxCombo: 0,
    perfectPosts: 0,
    streak: 0,
    errors: 0,

    // WPM tracking
    currentWPM: 0,
    bestWPM: 0,
    recentWPMs: [], // Last 10 WPMs
    avgWPM: 0,
    wpmRecordStreak: 0, // Times in a row beating avg

    // Bots owned (keyed by bot ID)
    bots: {
        // Tier 1: Early game (hours 0-2)
        replyGuy: 0,
        lurker: 0,
        shitposter: 0,
        burnerAccount: 0,
        // Tier 2: Mid game (hours 2-6)
        memeLord: 0,
        contentCreator: 0,
        blueCheck: 0,
        // Tier 3: Late game (hours 6-11)
        influencer: 0,
        cryptoBro: 0,
        grokAI: 0,
        // Tier 4: End game (hours 11-16)
        botFarm: 0,
        elonsAlt: 0,
        mediaEmpire: 0,
        // Tier 5: Infinite game (hours 16+)
        digitalGod: 0,
        realityWarper: 0
    },

    // Upgrades purchased (keyed by upgrade ID)
    upgrades: {},

    // Premium status
    hasXPremium: false,
    verificationTier: null, // 'blue', 'gold', 'gray', or null

    // Derived values (recalculated on change)
    coinsPerPost: 10,         // Base coins per completed post
    coinsPerSecond: 0,        // Passive income from bots
    followerMultiplier: 1,    // Multiplier from followers (1 + followers/1000)
    impressionsPerPost: 10,
    globalMultiplier: 1,      // Combined multiplier from all sources

    // Achievements unlocked
    achievements: [],
    unlockedAchievements: [],

    // Achievement tracking stats
    totalPosts: 0,
    viralPosts: 0,
    mainCharacterPosts: 0,
    bestCombo: 0,
    totalCharsTyped: 0,
    totalImpressions: 0,

    // New achievement tracking stats
    balloonPops: 0,
    goldenCharsHit: 0,
    proTyperPosts: 0,     // Posts with 95%+ accuracy AND 80+ WPM
    bestCPS: 0,           // Best characters per second
    xp: 0,                // Experience points (updated from lifetimePosts)
    heat: 0,              // Current heat level (0-100)

    // Prestige
    prestigeCount: 0,
    permanentBonuses: {},

    // Event system
    eventCoinMultiplier: 1,
    eventFollowerMultiplier: 1,
    eventImpressionMultiplier: 1,
    eventViralBonus: 0,
    eventBotMultiplier: 1,
    eventAllGolden: false,
    eventBonusViralPosts: 0,

    // Bonus mode (from floating clickable bonus)
    bonusModeActive: false,
    bonusModeMultiplier: 1,

    // Game meta
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    lastTickTime: Date.now(),
    totalPlayTime: 0,

    // Settings
    soundEnabled: true,
    volume: 0.7
};

// Current state
let state = { ...initialState };

// Subscribers for state changes
const subscribers = new Set();

// Event-specific subscribers
const eventSubscribers = new Map();

/**
 * Get current state (returns a shallow copy to prevent direct mutation)
 */
export function getState() {
    return { ...state };
}

/**
 * Get a specific value from state
 */
export function getValue(key) {
    return state[key];
}

/**
 * Update state with new values
 * @param {Object} updates - Key-value pairs to update
 * @param {boolean} silent - If true, don't notify subscribers
 */
export function updateState(updates, silent = false) {
    const oldState = { ...state };
    state = { ...state, ...updates };

    // Update lifetime stats if currencies increased
    if (updates.coins !== undefined && updates.coins > oldState.coins) {
        const gained = updates.coins - oldState.coins;
        state.lifetimeCoins += gained;
    }
    if (updates.followers !== undefined && updates.followers > oldState.followers) {
        const gained = updates.followers - oldState.followers;
        state.lifetimeFollowers += gained;
    }
    if (updates.impressions !== undefined && updates.impressions > oldState.impressions) {
        const gained = updates.impressions - oldState.impressions;
        state.lifetimeImpressions += gained;
    }

    if (!silent) {
        notifySubscribers(oldState, state);
    }
}

/**
 * Subscribe to all state changes
 * @param {Function} callback - Called with (newState, oldState) on change
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

/**
 * Subscribe to specific state key changes
 * @param {string} key - State key to watch
 * @param {Function} callback - Called with (newValue, oldValue) on change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToKey(key, callback) {
    if (!eventSubscribers.has(key)) {
        eventSubscribers.set(key, new Set());
    }
    eventSubscribers.get(key).add(callback);
    return () => eventSubscribers.get(key).delete(callback);
}

/**
 * Notify all subscribers of state change
 */
function notifySubscribers(oldState, newState) {
    // Notify general subscribers
    subscribers.forEach(callback => {
        try {
            callback(newState, oldState);
        } catch (e) {
            console.error('State subscriber error:', e);
        }
    });

    // Notify key-specific subscribers
    eventSubscribers.forEach((callbacks, key) => {
        if (oldState[key] !== newState[key]) {
            callbacks.forEach(callback => {
                try {
                    callback(newState[key], oldState[key]);
                } catch (e) {
                    console.error(`State subscriber error for key ${key}:`, e);
                }
            });
        }
    });
}

/**
 * Recalculate derived values based on current state
 * Called after significant changes (upgrades, bots, etc.)
 */
export function recalculateDerived() {
    const { bots, upgrades, followers, verificationTier, prestigeCount, permanentBonuses } = state;

    // Base values
    let baseCPS = 0;  // Coins per second from bots
    let baseCoinsPerPost = 10;
    let baseImpressionsPerPost = 10;
    let totalMultiplier = 1;

    // Calculate follower multiplier: 1 + (followers / 1000)
    // Caps at 10x boost at 9000 followers
    const followerMult = Math.min(1 + (followers / 1000), 10);

    // Calculate coins per second from bots
    // Each bot gives linearly more CPS: 1st=1x, 2nd=2x, 3rd=3x, etc.
    // Total CPS = baseCPS * (1+2+3+...+n) = baseCPS * n*(n+1)/2 (triangular growth)
    // Cost grows exponentially, CPS grows quadratically = satisfying progression
    const botData = getBotData();
    Object.entries(bots).forEach(([botId, count]) => {
        if (count > 0 && botData[botId]) {
            // Triangular number formula: n * (n + 1) / 2
            const triangularBonus = count * (count + 1) / 2;
            baseCPS += botData[botId].cps * triangularBonus;
        }
    });

    // Apply verification bonuses
    if (verificationTier === 'blue') {
        totalMultiplier *= 1.25;
        baseImpressionsPerPost *= 1.5;
    } else if (verificationTier === 'gold') {
        totalMultiplier *= 1.5;
        baseImpressionsPerPost *= 2;
    } else if (verificationTier === 'gray') {
        totalMultiplier *= 2;
        baseImpressionsPerPost *= 3;
    }

    // Apply prestige bonuses
    if (prestigeCount > 0) {
        totalMultiplier *= (1 + prestigeCount * 0.1);
    }

    // Apply permanent bonuses
    if (permanentBonuses.multiplier) {
        totalMultiplier *= permanentBonuses.multiplier;
    }

    // Apply follower multiplier to total
    totalMultiplier *= followerMult;

    // Apply bonus mode multiplier (5x from floating bonus)
    const bonusMult = state.bonusModeMultiplier || 1;
    const typingMultiplier = totalMultiplier * bonusMult;

    updateState({
        coinsPerSecond: baseCPS * totalMultiplier,
        coinsPerPost: baseCoinsPerPost * typingMultiplier,
        followerMultiplier: followerMult,
        impressionsPerPost: baseImpressionsPerPost * bonusMult,
        globalMultiplier: typingMultiplier
    }, true);
}

/**
 * Get bot data definitions (coins per second)
 * These values must match the BOTS in data/upgrades.js
 *
 * 20-HOUR PROGRESSION SCALING:
 * - Tier 1: Fast start (hours 0-2)
 * - Tier 2: Building momentum (hours 2-6)
 * - Tier 3: Mid-game grind (hours 6-11)
 * - Tier 4: Late game (hours 11-16)
 * - Tier 5: Infinite scaling (hours 16+)
 */
function getBotData() {
    return {
        // Tier 1: Early game (hours 0-2)
        replyGuy: { cps: 0.1 },
        lurker: { cps: 0.8 },
        shitposter: { cps: 6 },
        burnerAccount: { cps: 45 },
        // Tier 2: Mid game (hours 2-6)
        memeLord: { cps: 300 },
        contentCreator: { cps: 2000 },
        blueCheck: { cps: 13000 },
        // Tier 3: Late game (hours 6-11)
        influencer: { cps: 85000 },
        cryptoBro: { cps: 550000 },
        grokAI: { cps: 3500000 },
        // Tier 4: End game (hours 11-16)
        botFarm: { cps: 22000000 },
        elonsAlt: { cps: 140000000 },
        mediaEmpire: { cps: 900000000 },
        // Tier 5: Infinite game (hours 16+)
        digitalGod: { cps: 5500000000 },
        realityWarper: { cps: 35000000000 }
    };
}

/**
 * Add coins (main currency)
 */
export function addCoins(amount, source = 'typing') {
    const newCoins = state.coins + amount;
    updateState({ coins: newCoins });

    // Emit event for UI feedback
    window.dispatchEvent(new CustomEvent('coins-gained', {
        detail: { amount, source, total: newCoins }
    }));
}

/**
 * Add followers (passive multiplier currency)
 */
export function addFollowers(amount, source = 'typing') {
    const newFollowers = state.followers + amount;
    updateState({ followers: newFollowers });
    recalculateDerived(); // Recalc since followers affect multiplier

    // Emit event for UI feedback
    window.dispatchEvent(new CustomEvent('followers-gained', {
        detail: { amount, source, total: newFollowers }
    }));
}

/**
 * Add impressions
 */
export function addImpressions(amount) {
    updateState({
        impressions: state.impressions + amount,
        totalImpressions: (state.totalImpressions || 0) + amount
    });
}

/**
 * Spend coins (for purchases)
 * @returns {boolean} True if successful
 */
export function spendCoins(amount) {
    if (state.coins >= amount) {
        updateState({ coins: state.coins - amount });
        return true;
    }
    return false;
}

/**
 * Increment combo
 */
export function incrementCombo() {
    const newCombo = state.combo + 1;
    const newMaxCombo = Math.max(newCombo, state.maxCombo);
    updateState({
        combo: newCombo,
        maxCombo: newMaxCombo
    });
}

/**
 * Reset combo (on error)
 */
export function resetCombo() {
    updateState({
        combo: 0,
        errors: state.errors + 1
    });
}

/**
 * Complete a post
 */
export function completePost(isPerfect = false, viralType = null) {
    const updates = {
        lifetimePosts: state.lifetimePosts + 1,
        totalPosts: state.totalPosts + 1,
        streak: state.streak + 1,
        bestCombo: Math.max(state.bestCombo, state.maxCombo)
    };

    if (isPerfect) {
        updates.perfectPosts = state.perfectPosts + 1;
    }

    if (viralType) {
        updates.viralPosts = state.viralPosts + 1;
        // Track MAIN CHARACTER posts specifically
        if (viralType === 'MAIN CHARACTER') {
            updates.mainCharacterPosts = (state.mainCharacterPosts || 0) + 1;
        }
    }

    updateState(updates);
}

/**
 * Purchase a bot
 */
export function purchaseBot(botId, cost) {
    if (spendCoins(cost)) {
        const newBots = { ...state.bots };
        newBots[botId] = (newBots[botId] || 0) + 1;
        updateState({ bots: newBots });
        recalculateDerived();
        return true;
    }
    return false;
}

/**
 * Reset state for new game or prestige
 */
export function resetState(keepPermanent = false) {
    const permanentData = keepPermanent ? {
        prestigeCount: state.prestigeCount,
        permanentBonuses: state.permanentBonuses,
        achievements: state.achievements,
        lifetimeCoins: state.lifetimeCoins,
        lifetimeFollowers: state.lifetimeFollowers,
        lifetimeImpressions: state.lifetimeImpressions,
        lifetimePosts: state.lifetimePosts,
        bestWPM: state.bestWPM,
        soundEnabled: state.soundEnabled,
        volume: state.volume
    } : {};

    state = { ...initialState, ...permanentData };
    recalculateDerived();
    notifySubscribers(state, state);
}

/**
 * Load state from saved data
 */
export function loadState(savedState) {
    // Deep merge bots to ensure new bots are initialized
    const mergedBots = { ...initialState.bots, ...(savedState.bots || {}) };

    // Deep merge upgrades to ensure new upgrades don't break
    const mergedUpgrades = { ...(savedState.upgrades || {}) };

    state = {
        ...initialState,
        ...savedState,
        bots: mergedBots,
        upgrades: mergedUpgrades
    };
    recalculateDerived();
    notifySubscribers(state, state);
}

/**
 * Get state for saving (exclude transient data)
 */
export function getStateForSave() {
    const { currentPost, ...saveableState } = state;
    return saveableState;
}

// Initialize derived values
recalculateDerived();
