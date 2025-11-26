/**
 * Bot and Upgrade Definitions
 * Balanced like Cookie Clicker: consistent 1.15 cost mult, ~100-200s ROI
 * Each tier costs ~10x more, produces ~8x more (slight efficiency gain)
 */

// Bot definitions (cps = coins per second)
//
// SCALING PHILOSOPHY FOR 20-HOUR PROGRESSION:
// - Tier 1: Fast start, 1.12x cost mult (hours 0-2)
// - Tier 2: Building momentum, 1.15x cost mult (hours 2-6)
// - Tier 3: Mid-game grind, 1.17x cost mult (hours 6-11)
// - Tier 4: Late game, 1.18x cost mult (hours 11-16)
// - Tier 5: Infinite scaling, 1.20x cost mult (hours 16+)
//
// Each tier: ~10x cost increase, ~6-7x CPS increase (slight efficiency gain)
// Unlock thresholds set to natural progression points
//
export const BOTS = {
    // ===== TIER 1: EARLY GAME (Hours 0-2) =====
    // Goal: Get player hooked fast, show the loop works
    replyGuy: {
        id: 'replyGuy',
        name: 'Reply Guy',
        icon: '🤓',
        description: '"Actually..." on every post',
        baseCost: 25,              // Requires 2 posts (~10 coins each)
        costMult: 1.12,            // Gentle early scaling
        cps: 0.1,
        unlockAt: 0
    },
    lurker: {
        id: 'lurker',
        name: 'Lurker',
        icon: '🫣',
        description: 'Watches but never posts',
        baseCost: 100,             // ~1 minute of play
        costMult: 1.12,
        cps: 0.8,
        unlockAt: 50
    },
    shitposter: {
        id: 'shitposter',
        name: 'Shitposter',
        icon: '🤪',
        description: 'Chaos goblin energy',
        baseCost: 1100,            // ~5-10 minutes
        costMult: 1.12,
        cps: 6,
        unlockAt: 500
    },
    burnerAccount: {
        id: 'burnerAccount',
        name: 'Burner Account',
        icon: '🥸',
        description: 'Definitely not my main',
        baseCost: 12000,           // ~20-30 minutes
        costMult: 1.12,
        cps: 45,
        unlockAt: 5000
    },

    // ===== TIER 2: MID GAME (Hours 2-6) =====
    // Goal: Establish idle loop, meaningful choices
    memeLord: {
        id: 'memeLord',
        name: 'Meme Lord',
        icon: '🐸',
        description: 'Based and frog-pilled',
        baseCost: 130000,          // ~1-1.5 hours
        costMult: 1.15,
        cps: 300,
        unlockAt: 50000
    },
    contentCreator: {
        id: 'contentCreator',
        name: 'Content Creator',
        icon: '🎬',
        description: 'Like and subscribe!',
        baseCost: 1400000,         // ~2-3 hours
        costMult: 1.15,
        cps: 2000,
        unlockAt: 500000
    },
    blueCheck: {
        id: 'blueCheck',
        name: 'Blue Check',
        icon: '💸',
        description: 'Paid $8 for clout',
        baseCost: 15000000,        // ~4-5 hours
        costMult: 1.15,
        cps: 13000,
        unlockAt: 5000000
    },

    // ===== TIER 3: LATE GAME (Hours 6-11) =====
    // Goal: Reward patience, set up for prestige
    influencer: {
        id: 'influencer',
        name: 'Influencer',
        icon: '🪞',
        description: 'Ring light enthusiast',
        baseCost: 160000000,       // ~6-7 hours
        costMult: 1.17,
        cps: 85000,
        unlockAt: 50000000
    },
    cryptoBro: {
        id: 'cryptoBro',
        name: 'Crypto Bro',
        icon: '🦧',
        description: 'HODL and cope',
        baseCost: 1700000000,      // ~8-9 hours
        costMult: 1.17,
        cps: 550000,
        unlockAt: 500000000
    },
    grokAI: {
        id: 'grokAI',
        name: 'Grok AI',
        icon: '🧠',
        description: 'Hallucinating hot takes',
        baseCost: 18000000000,     // ~10-11 hours
        costMult: 1.17,
        cps: 3500000,
        unlockAt: 5000000000
    },

    // ===== TIER 4: END GAME (Hours 11-16) =====
    // Goal: Big numbers, prestige consideration
    botFarm: {
        id: 'botFarm',
        name: 'Bot Farm',
        icon: '🤖',
        description: 'Beep boop I am human',
        baseCost: 200000000000,    // ~12-13 hours
        costMult: 1.18,
        cps: 22000000,
        unlockAt: 50000000000
    },
    elonsAlt: {
        id: 'elonsAlt',
        name: "Elon's Alt",
        icon: '🤡',
        description: 'Posts at 3am',
        baseCost: 2200000000000,   // ~14-15 hours
        costMult: 1.18,
        cps: 140000000,
        unlockAt: 500000000000
    },
    mediaEmpire: {
        id: 'mediaEmpire',
        name: 'Media Empire',
        icon: '👑',
        description: 'The algorithm fears you',
        baseCost: 24000000000000,  // ~16-17 hours
        costMult: 1.18,
        cps: 900000000,
        unlockAt: 5000000000000
    },

    // ===== TIER 5: INFINITE GAME (Hours 16+) =====
    // Goal: Endless scaling for dedicated players
    digitalGod: {
        id: 'digitalGod',
        name: 'Digital God',
        icon: '👁️‍🗨️',
        description: 'I see all your posts',
        baseCost: 260000000000000,   // ~18-19 hours
        costMult: 1.20,
        cps: 5500000000,
        unlockAt: 50000000000000
    },
    realityWarper: {
        id: 'realityWarper',
        name: 'Reality Warper',
        icon: '🌀',
        description: 'Your posts break spacetime',
        baseCost: 2800000000000000,  // ~20+ hours
        costMult: 1.20,
        cps: 35000000000,
        unlockAt: 500000000000000
    }
};

// Bot CPS uses triangular growth: each bot gives more than the last
// Total CPS = baseCPS * n*(n+1)/2 where n = number of bots owned

// Upgrade definitions - multipliers and bonuses that stack
// Simplified to core upgrades only for cleaner progression
export const UPGRADES = {
    typingMastery: {
        id: 'typingMastery',
        name: 'Typing Mastery',
        icon: '⌨️',
        description: '+5% coins per typed post',
        baseCost: 500,
        costMult: 1.15,
        maxLevel: 100,
        unlockAt: 0,
        effect: (level) => 1 + level * 0.05
    },
    betterBots: {
        id: 'betterBots',
        name: 'Better Bots',
        icon: '🔧',
        description: '+5% all bot output',
        baseCost: 2000,
        costMult: 1.15,
        maxLevel: 200,
        unlockAt: 1000,
        effect: (level) => 1 + level * 0.05
    }
};

/**
 * Get bot by ID
 */
export function getBot(botId) {
    return BOTS[botId] || null;
}

/**
 * Get upgrade by ID
 */
export function getUpgrade(upgradeId) {
    return UPGRADES[upgradeId] || null;
}

/**
 * Get all unlocked bots based on lifetime coins
 */
export function getUnlockedBots(lifetimeCoins) {
    return Object.values(BOTS).filter(bot => lifetimeCoins >= bot.unlockAt);
}

/**
 * Get all unlocked upgrades based on lifetime coins
 */
export function getUnlockedUpgrades(lifetimeCoins) {
    return Object.values(UPGRADES).filter(upgrade => lifetimeCoins >= upgrade.unlockAt);
}

/**
 * Calculate upgrade cost at given level
 */
export function getUpgradeCost(upgradeId, currentLevel) {
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return Infinity;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel));
}

/**
 * Calculate bot cost at given count
 */
export function getBotCost(botId, currentCount) {
    const bot = BOTS[botId];
    if (!bot) return Infinity;
    return Math.floor(bot.baseCost * Math.pow(bot.costMult, currentCount));
}
