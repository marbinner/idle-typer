/**
 * Crypto Trade Data
 * Optimized engagement algorithm based on behavioral psychology
 *
 * Key principles:
 * - Variable ratio reinforcement (most engaging reward schedule)
 * - Near-miss effect (show jackpots during spin to create anticipation)
 * - Loss aversion mitigation (soften losses, amplify wins)
 * - Hot streak system (winning momentum)
 * - Comeback mechanics (losing builds towards guaranteed win)
 * - Win variance (±20% randomness makes wins more exciting)
 * - Progressive pity (smooth curve, not hard threshold)
 */

// Prize tiers - optimized distribution with more "feel good" tiers
export const PRIZE_TIERS = [
    { multiplier: 0, label: 'Rug Pulled', rarity: 'common', icon: '🪤', celebration: 'none' },
    { multiplier: 0.25, label: 'Got Rekt', rarity: 'common', icon: '💀', celebration: 'none' },
    { multiplier: 0.5, label: 'Paper Hands', rarity: 'common', icon: '📄', celebration: 'none' },
    { multiplier: 0.75, label: 'Weak Exit', rarity: 'uncommon', icon: '😰', celebration: 'none' },
    { multiplier: 1, label: 'Broke Even', rarity: 'uncommon', icon: '⚖️', celebration: 'small' },
    { multiplier: 1.5, label: 'Small Green', rarity: 'uncommon', icon: '📊', celebration: 'small' },
    { multiplier: 2, label: 'Nice Trade', rarity: 'rare', icon: '📈', celebration: 'medium' },
    { multiplier: 3, label: 'Good Call', rarity: 'rare', icon: '🎯', celebration: 'medium' },
    { multiplier: 5, label: 'Big Green', rarity: 'rare', icon: '🟢', celebration: 'large' },
    { multiplier: 10, label: 'Whale Move', rarity: 'epic', icon: '🐋', celebration: 'large' },
    { multiplier: 25, label: 'DIAMOND HANDS', rarity: 'epic', icon: '💎', celebration: 'epic' },
    { multiplier: 50, label: 'PERFECT ENTRY', rarity: 'legendary', icon: '🎰', celebration: 'legendary' },
    { multiplier: 100, label: '100X MOONSHOT', rarity: 'legendary', icon: '🚀', celebration: 'legendary' },
    { multiplier: 500, label: 'BECAME SATOSHI', rarity: 'mythic', icon: '₿', celebration: 'mythic' }
];

// Engagement algorithm configuration
const ALGORITHM_CONFIG = {
    // === FIRST IMPRESSION ===
    // First roll: guaranteed small win to teach the mechanic (tier 6 = 2x Nice Trade)
    firstRollTier: 6,

    // === PITY SYSTEM (Progressive) ===
    // Pity builds smoothly instead of hard threshold
    pityStartAt: 2,           // Start building pity after 2 losses
    pityMaxBoost: 0.35,       // Max 35% boost to win odds at max pity
    pityBuildRate: 0.07,      // 7% boost per consecutive loss
    pityGuaranteeAt: 6,       // Hard guarantee after 6 losses
    pityGuaranteeMinTier: 6,  // Guarantee at least 2x (Nice Trade)

    // === HOT STREAK SYSTEM ===
    // Winning momentum - wins increase chance of more wins
    hotStreakThreshold: 2,    // 2 wins in a row = hot streak
    hotStreakBoost: 0.15,     // 15% boost to good outcomes during streak
    hotStreakDecay: 0.5,      // Lose half the boost per non-win

    // === COMEBACK MECHANIC ===
    // After big loss, give hope with a near-win
    comebackTriggerLoss: 0,   // Trigger after rug pull (0x)
    comebackChance: 0.4,      // 40% chance next roll is decent
    comebackMinTier: 5,       // At least "Small Green" (1.5x)

    // === LUCKY ROLL ===
    // Random jackpot chance (keeps hope alive)
    luckyRollChance: 0.005,   // 0.5% chance
    luckyMinTier: 8,          // At least 5x

    // === SUPER LUCKY (Jackpot) ===
    superLuckyChance: 0.0005, // 0.05% chance for jackpot (1 in 2000)
    superLuckyMinTier: 11,    // 50x or higher

    // === WIN VARIANCE ===
    // Add ±20% randomness to wins for excitement
    winVariance: 0.2,

    // === LOSS SOFTENING ===
    // Partial refund on bad losses to reduce frustration
    rugPullRefund: 0.1,       // 10% refund on rug pulls

    // === BASE PROBABILITIES ===
    // Rebalanced for tiny positive EV (~1.02x) - feels fair but not exploitable
    // [0x, 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 3x, 5x, 10x, 25x, 50x, 100x, 500x]
    baseProbabilities: [
        0.20,   // Rug - painful but creates drama
        0.14,   // Got Rekt
        0.14,   // Paper Hands
        0.10,   // Weak Exit
        0.18,   // Broke Even (common - feels okay)
        0.10,   // Small Green (feels like a win)
        0.06,   // Nice Trade
        0.035,  // Good Call
        0.020,  // Big Green
        0.008,  // Whale Move
        0.003,  // DIAMOND HANDS
        0.0015, // PERFECT ENTRY
        0.0004, // 100X MOONSHOT
        0.0001  // BECAME SATOSHI (1 in 10,000)
    ]
    // Losses (0-0.75x): 58%, Break-even to small win (1-1.5x): 28%, Good wins (2x+): 14%
    // Expected value: ~1.02x (tiny profit on average, but high variance)
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
 */
export function getTradeCost(coinsPerSecond) {
    return Math.floor(CRYPTO_TRADE.baseCost + (coinsPerSecond * CRYPTO_TRADE.costMultiplier));
}

/**
 * Roll the crypto trade using optimized engagement algorithm
 * @param {number} cost - The cost paid for this trade
 * @param {Object} tradeState - Player's trade history state
 * @returns {Object} The prize won with all metadata
 */
export function rollCryptoTrade(cost, tradeState = {}) {
    const {
        totalTrades = 0,
        consecutiveLosses = 0,    // Trades where multiplier < 1
        consecutiveWins = 0,       // Trades where multiplier >= 1
        lastMultiplier = 1,        // Previous trade result
        hotStreakBonus = 0         // Current hot streak bonus
    } = tradeState;

    let tierIndex;
    let isGuaranteed = false;
    let triggerReason = 'normal';

    // === FIRST ROLL: Hook them with a satisfying win ===
    if (totalTrades === 0) {
        tierIndex = ALGORITHM_CONFIG.firstRollTier;
        isGuaranteed = true;
        triggerReason = 'firstRoll';
    }
    // === PITY GUARANTEE: Too many losses, force a win ===
    else if (consecutiveLosses >= ALGORITHM_CONFIG.pityGuaranteeAt) {
        // Tier scales with how long they've been losing
        const bonusTiers = Math.min(consecutiveLosses - ALGORITHM_CONFIG.pityGuaranteeAt, 3);
        tierIndex = ALGORITHM_CONFIG.pityGuaranteeMinTier + bonusTiers + Math.floor(Math.random() * 2);
        isGuaranteed = true;
        triggerReason = 'pityGuarantee';
    }
    // === COMEBACK: After rug pull, higher chance of recovery ===
    else if (lastMultiplier === ALGORITHM_CONFIG.comebackTriggerLoss && Math.random() < ALGORITHM_CONFIG.comebackChance) {
        tierIndex = ALGORITHM_CONFIG.comebackMinTier + Math.floor(Math.random() * 3);
        triggerReason = 'comeback';
    }
    // === SUPER LUCKY: Jackpot roll ===
    else if (Math.random() < ALGORITHM_CONFIG.superLuckyChance) {
        tierIndex = ALGORITHM_CONFIG.superLuckyMinTier + Math.floor(Math.random() * (PRIZE_TIERS.length - ALGORITHM_CONFIG.superLuckyMinTier));
        triggerReason = 'superLucky';
    }
    // === LUCKY ROLL: Random big win ===
    else if (Math.random() < ALGORITHM_CONFIG.luckyRollChance) {
        tierIndex = ALGORITHM_CONFIG.luckyMinTier + Math.floor(Math.random() * 3);
        triggerReason = 'lucky';
    }
    // === NORMAL ROLL: Weighted probabilities with modifiers ===
    else {
        // Calculate pity boost (progressive)
        let pityBoost = 0;
        if (consecutiveLosses >= ALGORITHM_CONFIG.pityStartAt) {
            const pityStacks = consecutiveLosses - ALGORITHM_CONFIG.pityStartAt;
            pityBoost = Math.min(pityStacks * ALGORITHM_CONFIG.pityBuildRate, ALGORITHM_CONFIG.pityMaxBoost);
        }

        // Calculate hot streak boost
        const streakBoost = consecutiveWins >= ALGORITHM_CONFIG.hotStreakThreshold
            ? ALGORITHM_CONFIG.hotStreakBoost
            : hotStreakBonus;

        // Combined boost
        const totalBoost = pityBoost + streakBoost;

        tierIndex = rollWithProbabilities(ALGORITHM_CONFIG.baseProbabilities, totalBoost);
        triggerReason = pityBoost > 0 ? 'pityBoosted' : (streakBoost > 0 ? 'hotStreak' : 'normal');
    }

    // Clamp tier index
    tierIndex = Math.max(0, Math.min(tierIndex, PRIZE_TIERS.length - 1));

    const prize = PRIZE_TIERS[tierIndex];

    // Calculate base amount
    let amount = Math.floor(cost * prize.multiplier);

    // Apply win variance for excitement (only on wins)
    if (prize.multiplier >= 1 && ALGORITHM_CONFIG.winVariance > 0) {
        const variance = 1 + (Math.random() * 2 - 1) * ALGORITHM_CONFIG.winVariance;
        amount = Math.floor(amount * variance);
    }

    // Apply rug pull refund (loss softening)
    if (prize.multiplier === 0 && ALGORITHM_CONFIG.rugPullRefund > 0) {
        amount = Math.floor(cost * ALGORITHM_CONFIG.rugPullRefund);
    }

    return {
        ...prize,
        amount,
        tierIndex,
        isGuaranteed,
        triggerReason,
        // Return updated state hints for the caller
        wasWin: prize.multiplier >= 1,
        wasLoss: prize.multiplier < 1,
        wasRugPull: prize.multiplier === 0,
        wasBigWin: prize.multiplier >= 5
    };
}

/**
 * Roll using weighted probabilities with boost to better outcomes
 */
function rollWithProbabilities(probabilities, boost = 0) {
    const roll = Math.random();
    let cumulative = 0;

    // Find the "break-even" point (where multiplier >= 1)
    const breakEvenIndex = 4; // 1x tier

    // Adjust probabilities: reduce losses, boost wins
    const adjusted = probabilities.map((p, i) => {
        if (i < breakEvenIndex) {
            // Reduce loss probability
            return p * (1 - boost);
        } else if (i >= breakEvenIndex + 2) {
            // Boost good win probability (2x and above)
            return p * (1 + boost * 2);
        }
        // Keep break-even and small wins stable
        return p * (1 + boost * 0.5);
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

    return 4; // Fallback to break-even (feels fair)
}

/**
 * Get a random prize for display (used in roulette animation)
 * Biased towards showing exciting prizes to build anticipation
 */
export function getRandomPrizeForDisplay(cost) {
    // 30% chance to show a high-value prize in the spin
    if (Math.random() < 0.3) {
        const highTierIndex = 8 + Math.floor(Math.random() * 6); // 5x to 500x
        const prize = PRIZE_TIERS[Math.min(highTierIndex, PRIZE_TIERS.length - 1)];
        return {
            ...prize,
            amount: Math.floor(cost * prize.multiplier),
            tierIndex: highTierIndex
        };
    }

    // Otherwise show realistic distribution
    const tierIndex = rollWithProbabilities(ALGORITHM_CONFIG.baseProbabilities);
    const prize = PRIZE_TIERS[tierIndex];
    return {
        ...prize,
        amount: Math.floor(cost * prize.multiplier),
        tierIndex
    };
}

/**
 * Get a specific prize tier
 */
export function getPrizeTier(tierIndex, cost) {
    const clampedIndex = Math.max(0, Math.min(tierIndex, PRIZE_TIERS.length - 1));
    const prize = PRIZE_TIERS[clampedIndex];
    return {
        ...prize,
        amount: Math.floor(cost * prize.multiplier),
        tierIndex: clampedIndex
    };
}

/**
 * Get the crypto trade data
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

/**
 * Get celebration level for a prize
 */
export function getCelebrationLevel(prize) {
    return prize.celebration || 'none';
}

/**
 * Calculate expected value for transparency
 * (Used for stats display, not affecting gameplay)
 */
export function getExpectedValue() {
    let ev = 0;
    for (let i = 0; i < ALGORITHM_CONFIG.baseProbabilities.length; i++) {
        ev += ALGORITHM_CONFIG.baseProbabilities[i] * PRIZE_TIERS[i].multiplier;
    }
    return ev; // Should be slightly < 1 for house edge
}
