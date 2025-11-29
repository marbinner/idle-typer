/**
 * Crypto Trade Data
 * Uses slot machine-style engagement algorithm
 * - First roll bonus: Guarantees a nice win to hook the player
 * - Pity timer: Consecutive losses increase win odds
 * - Near-miss system: Shows big prizes during spin
 * - Streak breaker: Prevents too many losses in a row
 */

// Prize tiers (index 0 = worst, index 8 = best)
export const PRIZE_TIERS = [
    { multiplier: 0, label: 'Rug Pulled', rarity: 'common', icon: '🪤' },
    { multiplier: 0.5, label: 'Paper Hands', rarity: 'common', icon: '📄' },
    { multiplier: 1, label: 'Broke Even', rarity: 'uncommon', icon: '⚖️' },
    { multiplier: 2, label: 'Nice Trade', rarity: 'uncommon', icon: '📈' },
    { multiplier: 5, label: 'Big Green', rarity: 'rare', icon: '🟢' },
    { multiplier: 10, label: 'Whale Move', rarity: 'epic', icon: '🐋' },
    { multiplier: 20, label: 'PERFECT ENTRY', rarity: 'epic', icon: '🎯' },
    { multiplier: 100, label: '100X TRADE', rarity: 'legendary', icon: '🚀' },
    { multiplier: 500, label: 'BECAME SATOSHI', rarity: 'mythic', icon: '₿' }
];

// Algorithm configuration
const ALGORITHM_CONFIG = {
    // First roll: guaranteed tier 4 (5x - Big Green)
    firstRollTier: 4,

    // Pity system: after X consecutive losses, force a win
    pityThreshold: 5,
    pityMinTier: 3, // At least 2x on pity

    // Streak breaker: max consecutive total losses before guaranteed profit
    maxLossStreak: 7,

    // Lucky roll chance (small chance for big win regardless of state)
    luckyRollChance: 0.02,
    luckyMinTier: 5,

    // Base probabilities for normal rolls (should sum to 1)
    // Weighted towards lower tiers but with hope
    baseProbabilities: [0.30, 0.28, 0.18, 0.12, 0.07, 0.03, 0.015, 0.004, 0.001]
};

export const CRYPTO_TRADE = {
    id: 'crypto',
    name: 'Crypto Trade',
    icon: '₿',
    description: 'Ape into the market. DYOR? Never heard of it.',
    color: '#f7931a',
    baseCost: 100,
    costMultiplier: 30
};

// Rarity colors for UI
export const RARITY_COLORS = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444'
};

// Rarity glow effects
export const RARITY_GLOW = {
    common: 'none',
    uncommon: '0 0 10px #22c55e',
    rare: '0 0 15px #3b82f6',
    epic: '0 0 20px #a855f7',
    legendary: '0 0 30px #f59e0b, 0 0 60px #f59e0b',
    mythic: '0 0 40px #ef4444, 0 0 80px #ef4444, 0 0 120px #ef4444'
};

/**
 * Calculate the current trade cost based on passive income
 * @param {number} coinsPerSecond - Current passive income
 * @returns {number} The cost of a trade
 */
export function getTradeCost(coinsPerSecond) {
    return Math.floor(CRYPTO_TRADE.baseCost + (coinsPerSecond * CRYPTO_TRADE.costMultiplier));
}

/**
 * Roll the crypto trade using engagement algorithm
 * @param {number} cost - The cost paid for this trade
 * @param {Object} tradeState - Player's trade history state
 * @returns {Object} The prize won { amount, label, rarity, icon, multiplier, tierIndex }
 */
export function rollCryptoTrade(cost, tradeState = {}) {
    const {
        totalTrades = 0,
        consecutiveLosses = 0,  // Trades where multiplier < 1
        lossStreak = 0          // Trades where multiplier = 0
    } = tradeState;

    let tierIndex;

    // FIRST ROLL: Give them a taste of winning
    if (totalTrades === 0) {
        tierIndex = ALGORITHM_CONFIG.firstRollTier;
    }
    // PITY TIMER: Too many losses, force a decent win
    else if (consecutiveLosses >= ALGORITHM_CONFIG.pityThreshold) {
        tierIndex = ALGORITHM_CONFIG.pityMinTier + Math.floor(Math.random() * 2); // tier 3 or 4
    }
    // STREAK BREAKER: Too many rug pulls, give them something
    else if (lossStreak >= ALGORITHM_CONFIG.maxLossStreak) {
        tierIndex = 2 + Math.floor(Math.random() * 2); // tier 2 or 3 (break even or small win)
    }
    // LUCKY ROLL: Small chance for big win
    else if (Math.random() < ALGORITHM_CONFIG.luckyRollChance) {
        tierIndex = ALGORITHM_CONFIG.luckyMinTier + Math.floor(Math.random() * (PRIZE_TIERS.length - ALGORITHM_CONFIG.luckyMinTier));
    }
    // NORMAL ROLL: Use weighted probabilities with pity boost
    else {
        // Boost higher tier odds slightly based on consecutive losses
        const pityBoost = Math.min(consecutiveLosses * 0.02, 0.1); // Up to 10% boost
        tierIndex = rollWithProbabilities(ALGORITHM_CONFIG.baseProbabilities, pityBoost);
    }

    // Clamp tier index
    tierIndex = Math.max(0, Math.min(tierIndex, PRIZE_TIERS.length - 1));

    const prize = PRIZE_TIERS[tierIndex];

    return {
        ...prize,
        amount: Math.floor(cost * prize.multiplier),
        tierIndex
    };
}

/**
 * Roll using weighted probabilities with optional boost to higher tiers
 */
function rollWithProbabilities(probabilities, highTierBoost = 0) {
    const roll = Math.random();
    let cumulative = 0;

    // Adjust probabilities: take from low tiers, give to high tiers
    const adjusted = probabilities.map((p, i) => {
        if (i < 2) return p * (1 - highTierBoost); // Reduce low tier odds
        if (i >= 4) return p * (1 + highTierBoost * 2); // Boost high tier odds
        return p;
    });

    // Normalize
    const sum = adjusted.reduce((a, b) => a + b, 0);
    const normalized = adjusted.map(p => p / sum);

    for (let i = 0; i < normalized.length; i++) {
        cumulative += normalized[i];
        if (roll < cumulative) {
            return i;
        }
    }

    return 0; // Fallback
}

/**
 * Get a random prize for display (used in roulette animation)
 * Uses base probabilities without engagement modifiers
 */
export function getRandomPrizeForDisplay(cost) {
    const tierIndex = rollWithProbabilities(ALGORITHM_CONFIG.baseProbabilities);
    const prize = PRIZE_TIERS[tierIndex];
    return {
        ...prize,
        amount: Math.floor(cost * prize.multiplier),
        tierIndex
    };
}

/**
 * Get a specific prize tier (for showing jackpots in roulette)
 */
export function getPrizeTier(tierIndex, cost) {
    const prize = PRIZE_TIERS[Math.min(tierIndex, PRIZE_TIERS.length - 1)];
    return {
        ...prize,
        amount: Math.floor(cost * prize.multiplier),
        tierIndex
    };
}

/**
 * Get the crypto trade data
 * @returns {Object} The trade data
 */
export function getCryptoTrade() {
    return CRYPTO_TRADE;
}

/**
 * Check if a prize is a "loss" (multiplier < 1)
 */
export function isLoss(prize) {
    return prize.multiplier < 1;
}

/**
 * Check if a prize is a total loss (rug pull)
 */
export function isRugPull(prize) {
    return prize.multiplier === 0;
}
