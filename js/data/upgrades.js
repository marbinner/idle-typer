/**
 * Bot and Upgrade Definitions
 * Balanced like Cookie Clicker: consistent 1.15 cost mult, ~100-200s ROI
 * Each tier costs ~10x more, produces ~8x more (slight efficiency gain)
 */

// Bot definitions (cps = coins per second)
// Bots use 1.20 cost multiplier (steeper than Cookie Clicker for longer progression)
// Each bot of the same type gives +1% more CPS (cumulative bonus)
// Unlock thresholds spaced ~10x apart for meaningful progression milestones
export const BOTS = {
    // ===== TIER 1: EARLY GAME =====
    replyGuy: {
        id: 'replyGuy',
        name: 'Reply Guy',
        icon: '💬',
        description: '"Great post!" on everything',
        baseCost: 200,
        costMult: 1.20,
        cps: 0.1,
        unlockAt: 0
    },
    lurker: {
        id: 'lurker',
        name: 'Lurker',
        icon: '👀',
        description: 'Silent but deadly engagement',
        baseCost: 2000,
        costMult: 1.20,
        cps: 1,
        unlockAt: 1000        // ~100 posts to unlock
    },
    burnerAccount: {
        id: 'burnerAccount',
        name: 'Burner Account',
        icon: '🔥',
        description: 'Anonymous chaos generator',
        baseCost: 200000,
        costMult: 1.20,
        cps: 8,
        unlockAt: 10000       // Need some lurkers working
    },
    shitposter: {
        id: 'shitposter',
        name: 'Shitposter',
        icon: '💩',
        description: 'Low effort, high volume',
        baseCost: 12000,
        costMult: 1.20,
        cps: 47,
        unlockAt: 100000      // Significant early milestone
    },

    // ===== TIER 2: MID GAME =====
    memeLord: {
        id: 'memeLord',
        name: 'Meme Lord',
        icon: '🐸',
        description: 'Pepe enthusiast',
        baseCost: 130000,
        costMult: 1.20,
        cps: 260,
        unlockAt: 1000000     // 1M lifetime coins
    },
    contentCreator: {
        id: 'contentCreator',
        name: 'Content Creator',
        icon: '📱',
        description: 'Consistent daily content',
        baseCost: 1400000,
        costMult: 1.20,
        cps: 1400,
        unlockAt: 10000000    // 10M lifetime coins
    },
    blueCheck: {
        id: 'blueCheck',
        name: 'Blue Check',
        icon: '✓',
        description: '$8/month premium account',
        baseCost: 20000000,
        costMult: 1.20,
        cps: 7800,
        unlockAt: 100000000   // 100M lifetime coins
    },

    // ===== TIER 3: LATE GAME =====
    influencer: {
        id: 'influencer',
        name: 'Influencer',
        icon: '🌟',
        description: '500K+ followers',
        baseCost: 330000000,
        costMult: 1.20,
        cps: 44000,
        unlockAt: 1000000000  // 1B lifetime coins
    },
    cryptoBro: {
        id: 'cryptoBro',
        name: 'Crypto Bro',
        icon: '📈',
        description: 'WAGMI energy',
        baseCost: 5100000000,
        costMult: 1.20,
        cps: 260000,
        unlockAt: 10000000000 // 10B lifetime coins
    },
    grokAI: {
        id: 'grokAI',
        name: 'Grok AI',
        icon: '🤖',
        description: 'AI-generated hot takes',
        baseCost: 75000000000,
        costMult: 1.20,
        cps: 1600000,
        unlockAt: 100000000000 // 100B lifetime coins
    },

    // ===== TIER 4: END GAME =====
    botFarm: {
        id: 'botFarm',
        name: 'Bot Farm',
        icon: '🏭',
        description: 'Industrial scale posting',
        baseCost: 1000000000000,
        costMult: 1.20,
        cps: 10000000,
        unlockAt: 1000000000000 // 1T lifetime coins
    },
    elonsAlt: {
        id: 'elonsAlt',
        name: "Elon's Alt",
        icon: '🚀',
        description: 'Main character energy',
        baseCost: 14000000000000,
        costMult: 1.20,
        cps: 65000000,
        unlockAt: 10000000000000 // 10T lifetime coins
    },
    mediaEmpire: {
        id: 'mediaEmpire',
        name: 'Media Empire',
        icon: '🏰',
        description: 'You own the algorithm',
        baseCost: 170000000000000,
        costMult: 1.20,
        cps: 430000000,
        unlockAt: 100000000000000 // 100T lifetime coins
    },

    // ===== TIER 5: INFINITE GAME =====
    digitalGod: {
        id: 'digitalGod',
        name: 'Digital God',
        icon: '👁️',
        description: 'Omniscient social presence',
        baseCost: 2100000000000000,
        costMult: 1.20,
        cps: 2900000000,
        unlockAt: 1000000000000000 // 1 Quadrillion
    },
    realityWarper: {
        id: 'realityWarper',
        name: 'Reality Warper',
        icon: '✨',
        description: 'Your posts reshape existence',
        baseCost: 26000000000000000,
        costMult: 1.20,
        cps: 21000000000,
        unlockAt: 10000000000000000 // 10 Quadrillion
    }
};

// Bot CPS uses triangular growth: each bot gives more than the last
// Total CPS = baseCPS * n*(n+1)/2 where n = number of bots owned

// Upgrade definitions - multipliers and bonuses that stack
// Using consistent 1.15 cost multiplier where appropriate
export const UPGRADES = {
    // ===== TIER 1: EARLY GAME (unlock with first bots) =====
    typingMastery: {
        id: 'typingMastery',
        name: 'Typing Mastery',
        icon: '⌨️',
        description: '+5% coins per typed post',
        baseCost: 5000,
        costMult: 1.15,
        maxLevel: 50,
        unlockAt: 0,
        effect: (level) => 1 + level * 0.05
    },
    betterBots: {
        id: 'betterBots',
        name: 'Better Bots',
        icon: '🔧',
        description: '+5% all bot output',
        baseCost: 500,
        costMult: 1.15,
        maxLevel: 100,
        unlockAt: 100,
        effect: (level) => 1 + level * 0.05
    },
    goldenChance: {
        id: 'goldenChance',
        name: 'Golden Chance',
        icon: '🪙',
        description: '+2% golden character spawn rate',
        baseCost: 1000,
        costMult: 1.15,
        maxLevel: 25,
        unlockAt: 500,
        effect: (level) => level * 0.02
    },

    // ===== TIER 2: MID GAME (unlock with 2nd tier bots) =====
    viralPotential: {
        id: 'viralPotential',
        name: 'Viral Potential',
        icon: '📊',
        description: '+1% viral chance',
        baseCost: 10000,
        costMult: 1.15,
        maxLevel: 20,
        unlockAt: 5000,
        effect: (level) => level * 0.01
    },
    charisma: {
        id: 'charisma',
        name: 'Charisma',
        icon: '😎',
        description: '+10% followers per post',
        baseCost: 25000,
        costMult: 1.15,
        maxLevel: 50,
        unlockAt: 10000,
        effect: (level) => 1 + level * 0.1
    },
    balloonBoost: {
        id: 'balloonBoost',
        name: 'Balloon Boost',
        icon: '🎈',
        description: '+10% balloon pop reward',
        baseCost: 50000,
        costMult: 1.15,
        maxLevel: 50,
        unlockAt: 25000,
        effect: (level) => 1 + level * 0.1
    },
    synergy: {
        id: 'synergy',
        name: 'Bot Synergy',
        icon: '🔗',
        description: '+1% CPS per bot type owned',
        baseCost: 100000,
        costMult: 1.15,
        maxLevel: 50,
        unlockAt: 50000,
        effect: (level) => 1 + level * 0.01
    },

    // ===== TIER 3: LATE GAME =====
    globalBoost: {
        id: 'globalBoost',
        name: 'Global Boost',
        icon: '🌍',
        description: '+2% all coin earnings',
        baseCost: 1000000,
        costMult: 1.15,
        maxLevel: 100,
        unlockAt: 500000,
        effect: (level) => 1 + level * 0.02
    },
    goldenValue: {
        id: 'goldenValue',
        name: 'Golden Value',
        icon: '💰',
        description: '+15% golden character bonus',
        baseCost: 5000000,
        costMult: 1.15,
        maxLevel: 40,
        unlockAt: 2500000,
        effect: (level) => 1 + level * 0.15
    },
    algorithmHack: {
        id: 'algorithmHack',
        name: 'Algorithm Hack',
        icon: '🧠',
        description: '+8% viral multiplier',
        baseCost: 25000000,
        costMult: 1.15,
        maxLevel: 40,
        unlockAt: 10000000,
        effect: (level) => 1 + level * 0.08
    },

    // ===== TIER 4: END GAME =====
    celebrity: {
        id: 'celebrity',
        name: 'Celebrity Status',
        icon: '⭐',
        description: '+15% follower multiplier effect',
        baseCost: 500000000,
        costMult: 1.15,
        maxLevel: 25,
        unlockAt: 100000000,
        effect: (level) => 1 + level * 0.15
    },
    exponentialGrowth: {
        id: 'exponentialGrowth',
        name: 'Exponential Growth',
        icon: '📈',
        description: '+1% multiplicative bonus',
        baseCost: 5000000000,
        costMult: 1.15,
        maxLevel: 50,
        unlockAt: 1000000000,
        effect: (level) => Math.pow(1.01, level)
    },
    cosmicPower: {
        id: 'cosmicPower',
        name: 'Cosmic Power',
        icon: '🌟',
        description: '+5% all multipliers',
        baseCost: 100000000000,
        costMult: 1.15,
        maxLevel: 40,
        unlockAt: 10000000000,
        effect: (level) => 1 + level * 0.05
    },

    // ===== TIER 5: INFINITE SCALING =====
    ultimatePoster: {
        id: 'ultimatePoster',
        name: 'Ultimate Poster',
        icon: '👑',
        description: 'Double all earnings',
        baseCost: 10000000000000,
        costMult: 2.0,
        maxLevel: 10,
        unlockAt: 1000000000000,
        effect: (level) => Math.pow(2, level)
    },
    eternityBoost: {
        id: 'eternityBoost',
        name: 'Eternity Boost',
        icon: '♾️',
        description: '+1% all earnings (infinite)',
        baseCost: 100000000000000,
        costMult: 1.15,
        maxLevel: Infinity,
        unlockAt: 10000000000000,
        effect: (level) => 1 + level * 0.01
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
