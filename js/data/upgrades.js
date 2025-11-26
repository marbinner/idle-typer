/**
 * Bot and Upgrade Definitions
 */

// Bot definitions (cps = coins per second)
// Tuned for engaging progression: ~60-90 second ROI per tier
export const BOTS = {
    replyGuy: {
        id: 'replyGuy',
        name: 'Reply Guy',
        icon: '💬',
        description: '"Great post!" energy',
        baseCost: 15,          // Very cheap - first purchase in ~30s
        costMult: 1.12,
        cps: 0.2,              // 75s ROI
        unlockAt: 0
    },
    burnerAccount: {
        id: 'burnerAccount',
        name: 'Burner Account',
        icon: '🔥',
        description: 'Anonymous chaos generator',
        baseCost: 100,
        costMult: 1.12,
        cps: 1,                // 100s ROI
        unlockAt: 50
    },
    shitposter: {
        id: 'shitposter',
        name: 'Shitposter',
        icon: '💩',
        description: 'Low effort, high volume',
        baseCost: 500,
        costMult: 1.11,
        cps: 6,                // 83s ROI
        unlockAt: 200
    },
    contentCreator: {
        id: 'contentCreator',
        name: 'Content Creator',
        icon: '📱',
        description: 'Consistent daily content',
        baseCost: 2000,
        costMult: 1.10,
        cps: 25,               // 80s ROI
        unlockAt: 1000
    },
    blueCheck: {
        id: 'blueCheck',
        name: 'Blue Check',
        icon: '✓',
        description: 'X Premium verified account',
        baseCost: 8000,
        costMult: 1.09,
        cps: 100,              // 80s ROI
        unlockAt: 5000
    },
    influencer: {
        id: 'influencer',
        name: 'Influencer',
        icon: '🌟',
        description: '500K+ followers',
        baseCost: 30000,
        costMult: 1.08,
        cps: 400,              // 75s ROI
        unlockAt: 20000
    },
    newsAccount: {
        id: 'newsAccount',
        name: 'News Account',
        icon: '📰',
        description: 'Breaking news 24/7',
        baseCost: 100000,
        costMult: 1.07,
        cps: 1500,             // 67s ROI
        unlockAt: 75000
    },
    grokAI: {
        id: 'grokAI',
        name: 'Grok AI',
        icon: '🤖',
        description: 'AI-generated hot takes',
        baseCost: 400000,
        costMult: 1.06,
        cps: 6000,             // 67s ROI
        unlockAt: 300000
    },
    botFarm: {
        id: 'botFarm',
        name: 'Bot Farm',
        icon: '🏭',
        description: 'Industrial scale posting',
        baseCost: 2000000,
        costMult: 1.05,
        cps: 30000,            // 67s ROI
        unlockAt: 1500000
    },
    elonsAlt: {
        id: 'elonsAlt',
        name: "Elon's Alt",
        icon: '🚀',
        description: 'Main character energy',
        baseCost: 10000000,
        costMult: 1.04,
        cps: 150000,           // 67s ROI
        unlockAt: 8000000
    },
    mediaEmpire: {
        id: 'mediaEmpire',
        name: 'Media Empire',
        icon: '🏰',
        description: 'You are the algorithm',
        baseCost: 100000000,
        costMult: 1.03,
        cps: 1500000,          // 67s ROI
        unlockAt: 50000000
    }
};

// Upgrade definitions
export const UPGRADES = {
    viralPotential: {
        id: 'viralPotential',
        name: 'Viral Potential',
        icon: '📈',
        description: '+10% followers per post',
        baseCost: 100,
        costMult: 1.5,
        maxLevel: 50,
        unlockAt: 0,
        effect: (level) => {
            // Applied in typing.js calculations
        }
    },
    engagementBait: {
        id: 'engagementBait',
        name: 'Engagement Bait',
        icon: '🎣',
        description: '+5% impressions per post',
        baseCost: 200,
        costMult: 1.5,
        maxLevel: 50,
        unlockAt: 500,
        effect: (level) => {
            // Applied in typing.js calculations
        }
    },
    algorithmHack: {
        id: 'algorithmHack',
        name: 'Algorithm Hack',
        icon: '⚡',
        description: '+2% viral chance',
        baseCost: 1000,
        costMult: 2,
        maxLevel: 25,
        unlockAt: 2000,
        effect: (level) => {
            // Applied in typing.js viral check
        }
    },
    botEfficiency: {
        id: 'botEfficiency',
        name: 'Bot Efficiency',
        icon: '🔧',
        description: '+10% bot output',
        baseCost: 5000,
        costMult: 1.8,
        maxLevel: 50,
        unlockAt: 10000,
        effect: (level) => {
            // Applied in idle.js calculations
        }
    },
    typingSpeed: {
        id: 'typingSpeed',
        name: 'Typing Speed',
        icon: '⌨️',
        description: '+5% combo multiplier cap',
        baseCost: 2500,
        costMult: 2,
        maxLevel: 20,
        unlockAt: 5000,
        effect: (level) => {
            // Applied in typing.js calculations
        }
    },
    comboMaster: {
        id: 'comboMaster',
        name: 'Combo Master',
        icon: '🔥',
        description: 'Combo decays slower',
        baseCost: 10000,
        costMult: 2.5,
        maxLevel: 10,
        unlockAt: 25000,
        effect: (level) => {
            // Applied in typing.js
        }
    },
    offlineGains: {
        id: 'offlineGains',
        name: 'Offline Gains',
        icon: '💤',
        description: '+10% offline efficiency',
        baseCost: 50000,
        costMult: 3,
        maxLevel: 10,
        unlockAt: 100000,
        effect: (level) => {
            // Applied in app.js offline calculation
        }
    },
    luckyAlgorithm: {
        id: 'luckyAlgorithm',
        name: 'Lucky Algorithm',
        icon: '🍀',
        description: '+1% golden character chance',
        baseCost: 25000,
        costMult: 2.5,
        maxLevel: 20,
        unlockAt: 50000,
        effect: (level) => {
            // Applied in typing.js
        }
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
 * Get all unlocked bots based on lifetime followers
 */
export function getUnlockedBots(lifetimeFollowers) {
    return Object.values(BOTS).filter(bot => lifetimeFollowers >= bot.unlockAt);
}

/**
 * Get all unlocked upgrades based on lifetime followers
 */
export function getUnlockedUpgrades(lifetimeFollowers) {
    return Object.values(UPGRADES).filter(upgrade => lifetimeFollowers >= upgrade.unlockAt);
}
