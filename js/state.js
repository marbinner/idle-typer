/**
 * Central State Management with Pub/Sub Pattern
 * Single source of truth for all game data
 */

import { TYPING_CONFIG, FOLLOWER_CONFIG, MISC_CONFIG } from './config.js';
import { BOTS, UPGRADES } from './data/upgrades.js';

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

    // Bots owned (keyed by bot ID) - dynamically initialized from BOTS
    bots: Object.keys(BOTS).reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),

    // Upgrades purchased (keyed by upgrade ID)
    upgrades: {},

    // Premium status
    hasXPremium: false,
    verificationTier: null, // 'blue', 'gold', 'gray', or null
    tierUpgrades: {}, // Tier boost upgrades (keyed by tier number 1-10)

    // Derived values (recalculated on change)
    coinsPerPost: 10,         // Base coins per completed post
    coinsPerSecond: 0,        // Passive income from bots
    followerMultiplier: 1,    // Multiplier from followers (1 + followers/1000)
    impressionsPerPost: 10,
    globalMultiplier: 1,      // Combined multiplier from all sources
    botCostDiscount: 1,       // Bot cost discount from Tier 3 upgrade (1 = no discount)
    followerGainBonus: 1,     // Follower gain bonus from Tier 4 upgrade
    comboBonus: 1,            // Combo bonus from Tier 5 upgrade
    offlineBonus: 1,          // Offline earnings bonus from Tier 7 upgrade
    goldenChanceMultiplier: 1, // Golden char chance from Tier 8 upgrade

    // Achievements unlocked
    achievements: [],
    unlockedAchievements: [],

    // Achievement tracking stats
    totalPosts: 0,
    viralPosts: 0,
    postsSinceViral: 0,    // Pity timer for viral posts
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

    // Bickering challenge stats
    bickeringWins: 0,
    bickeringLosses: 0,
    bickeringSkips: 0,

    // Gambling/Market stats
    lootBoxesOpened: 0,
    gamblingProfit: 0,         // Net profit/loss from gambling
    biggestWin: 0,             // Largest single win
    consecutiveLosses: 0,      // Trades where multiplier < 1 (for pity timer)
    lossStreak: 0,             // Consecutive rug pulls (multiplier = 0)

    // Critical Hit stats
    criticalHits: 0,           // Total critical hits landed

    // Frenzy Mode stats
    frenzyActivations: 0,      // Times frenzy was activated
    frenzyActive: false,       // Is frenzy currently active

    // Spin Wheel
    lastSpinTime: null,        // Timestamp of last spin (hourly cooldown)
    nextPostMultiplier: 1,     // Buff from spin wheel (2x or 5x next post)

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
// CPS milestones for celebration
const CPS_MILESTONES = [1, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];

export function recalculateDerived() {
    const oldCPS = state.coinsPerSecond || 0;
    const { bots, upgrades, followers, verificationTier, prestigeCount, permanentBonuses, tierUpgrades } = state;

    // Base values
    let baseCPS = 0;  // Coins per second from bots
    let baseImpressionsPerPost = 10;
    let totalMultiplier = 1;

    // Apply purchased upgrades
    // Typing Mastery: +5% coins per typed post per level
    const typingMasteryLevel = upgrades?.typingMastery || 0;
    const typingMasteryMult = UPGRADES.typingMastery.effect(typingMasteryLevel);

    // Better Bots: +5% all bot output per level
    const betterBotsLevel = upgrades?.betterBots || 0;
    const betterBotsMult = UPGRADES.betterBots.effect(betterBotsLevel);

    // Tier upgrade bonuses (unique effects)
    // Tier 1: +50% Tier 1 CPS (handled in bot loop)
    // Tier 2: +25% typing coins
    const typingBonus = tierUpgrades?.[2] ? 1.25 : 1;
    // Tier 3: +50% Tier 3 CPS + -10% bot costs
    const botCostDiscount = tierUpgrades?.[3] ? 0.9 : 1;
    // Tier 4: +50% follower gains
    const followerGainBonus = tierUpgrades?.[4] ? 1.5 : 1;
    // Tier 5: +50% Tier 5 CPS + 2x combo bonus
    const comboBonus = tierUpgrades?.[5] ? 2 : 1;
    // Tier 6: +25% all bot output
    const allCpsBonus = tierUpgrades?.[6] ? 1.25 : 1;
    // Tier 7: +50% Tier 7 CPS + +50% offline earnings
    const offlineBonus = tierUpgrades?.[7] ? 1.5 : 1;
    // Tier 8: Golden chars 2x more frequent
    const goldenChanceMultiplier = tierUpgrades?.[8] ? 2 : 1;
    // Tier 9: +50% Tier 9 CPS + +100% impressions
    const impressionsBonus = tierUpgrades?.[9] ? 2 : 1;
    // Tier 10: 2x ALL multipliers!
    const ultimateMultiplier = tierUpgrades?.[10] ? 2 : 1;

    // Calculate follower multiplier with continuous scaling (no hard cap)
    // Uses sqrt scaling for smooth continuous growth
    // Guard against division by zero (defensive programming)
    const sqrtDivisor = FOLLOWER_CONFIG.sqrtDivisor || 30;
    const followerMult = 1 + Math.sqrt(Math.max(0, followers)) / sqrtDivisor;

    // Calculate coins per second from bots
    // Each bot gives linearly more CPS: 1st=1x, 2nd=2x, 3rd=3x, etc.
    // Total CPS = baseCPS * (1+2+3+...+n) = baseCPS * n*(n+1)/2 (triangular growth)
    // Cost grows exponentially, CPS grows quadratically = satisfying progression
    const botData = getBotData();
    const botIds = Object.keys(botData);
    Object.entries(bots).forEach(([botId, count]) => {
        if (count > 0 && botData[botId]) {
            // Triangular number formula: n * (n + 1) / 2
            const triangularBonus = count * (count + 1) / 2;
            let botCPS = botData[botId].cps * triangularBonus;

            // Apply tier-specific CPS bonus (+50% for tiers 1,3,5,7,9 if upgrade owned)
            const botIndex = botIds.indexOf(botId);
            const botTier = Math.floor(botIndex / 15) + 1;
            if (tierUpgrades && tierUpgrades[botTier] && [1, 3, 5, 7, 9].includes(botTier)) {
                botCPS *= 1.5;
            }

            baseCPS += botCPS;
        }
    });

    // Apply Tier 6 bonus: +25% all bot output
    baseCPS *= allCpsBonus;

    // Apply Better Bots upgrade: +5% per level
    baseCPS *= betterBotsMult;

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

    // Apply Tier 9 bonus: +100% impressions
    baseImpressionsPerPost *= impressionsBonus;

    // Apply prestige bonuses
    if (prestigeCount > 0) {
        totalMultiplier *= (1 + prestigeCount * 0.1);
    }

    // Apply permanent bonuses
    if (permanentBonuses?.multiplier) {
        totalMultiplier *= permanentBonuses.multiplier;
    }

    // Apply follower multiplier to total
    totalMultiplier *= followerMult;

    // Apply Tier 10 ultimate multiplier
    totalMultiplier *= ultimateMultiplier;

    // Apply bonus mode multiplier (5x from floating bonus)
    const bonusMult = state.bonusModeMultiplier || 1;
    // Include Typing Mastery upgrade (+5% per level) and Tier 2 bonus
    const typingMultiplier = totalMultiplier * bonusMult * typingBonus * typingMasteryMult;

    // Calculate final CPS (include event multiplier so events affect passive income)
    const eventMult = state.eventCoinMultiplier || 1;
    const finalCPS = baseCPS * totalMultiplier * eventMult;

    // Scale coinsPerPost with CPS to keep typing relevant throughout progression
    // This ensures combo bonuses, golden chars, and viral posts all scale properly
    // Note: Use baseCPS (before multipliers) since typingMultiplier is applied separately
    const baseCoinsPerPost = Math.max(
        TYPING_CONFIG.baseCoinsPerPost,
        baseCPS * TYPING_CONFIG.cpsScalingFactor
    );

    updateState({
        coinsPerSecond: finalCPS,
        coinsPerPost: baseCoinsPerPost * typingMultiplier,
        followerMultiplier: followerMult,
        impressionsPerPost: baseImpressionsPerPost * bonusMult,
        globalMultiplier: typingMultiplier,
        // Store tier bonuses for other modules to use
        botCostDiscount,
        followerGainBonus,
        comboBonus,
        offlineBonus,
        goldenChanceMultiplier
    }, true);

    // Check for CPS milestone crossings
    for (const milestone of CPS_MILESTONES) {
        if (oldCPS < milestone && finalCPS >= milestone) {
            window.dispatchEvent(new CustomEvent('cps-milestone', {
                detail: { milestone, cps: finalCPS }
            }));
            break; // Only one milestone at a time
        }
    }
}

/**
 * Get bot CPS data from the centralized BOTS definition
 * No longer hardcoded - uses the formula-generated values from upgrades.js
 */
function getBotData() {
    // Transform BOTS into the format expected by recalculateDerived
    const botData = {};
    Object.entries(BOTS).forEach(([id, bot]) => {
        botData[id] = { cps: bot.cps };
    });
    return botData;
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

// Follower milestones for celebration
const FOLLOWER_MILESTONES = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000];

/**
 * Add followers (passive multiplier currency)
 */
export function addFollowers(amount, source = 'typing') {
    // Apply Tier 4 follower gain bonus
    const bonus = state.followerGainBonus || 1;
    const boostedAmount = Math.floor(amount * bonus);

    const oldFollowers = state.followers;
    const newFollowers = state.followers + boostedAmount;
    updateState({ followers: newFollowers });
    recalculateDerived(); // Recalc since followers affect multiplier

    // Check for milestone crossings
    for (const milestone of FOLLOWER_MILESTONES) {
        if (oldFollowers < milestone && newFollowers >= milestone) {
            window.dispatchEvent(new CustomEvent('follower-milestone', {
                detail: { milestone, total: newFollowers }
            }));
            break; // Only one milestone at a time
        }
    }

    // Emit event for UI feedback
    window.dispatchEvent(new CustomEvent('followers-gained', {
        detail: { amount: boostedAmount, source, total: newFollowers }
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
    // Pass empty object as oldState so key-specific subscribers are triggered
    notifySubscribers({}, state);
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
    // Pass empty object as oldState so key-specific subscribers are triggered
    notifySubscribers({}, state);
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
