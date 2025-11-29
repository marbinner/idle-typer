/**
 * Game Balance Configuration
 * All tuning knobs centralized for easy adjustment
 */

// =============================================================================
// BOT GENERATION CONFIG
// =============================================================================
// Adjust these values to tune the entire game's bot progression

export const BOT_CONFIG = {
    // Starting values for first bot
    firstBotCost: 25,
    firstBotCPS: 0.1,

    // Cost scaling between bot types: starts high, decreases over time
    costScaleStart: 20,   
    costScaleEnd: 40,     
    costScaleDecay: 0.985,   // Slow decay across 150 bots

    // ROI (Return on Investment) in seconds - increases over time
    baseROI: 300,            // First bot pays for itself in ~300s (5 min)
    roiGrowth: 1.04,         // Each bot takes ~4% longer to pay off
    // Bot 50: ~35 min ROI, Bot 100: ~4 hours ROI, Bot 150: ~28 hours ROI

    // Cost multiplier per owned bot (by tier) - 10 tiers for 150 bots
    tierCostMults: [
        1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10,  // Tier 1: bots 0-14
        1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11, 1.11,  // Tier 2: bots 15-29
        1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12, 1.12,  // Tier 3: bots 30-44
        1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13, 1.13,  // Tier 4: bots 45-59
        1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14, 1.14,  // Tier 5: bots 60-74
        1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15,  // Tier 6: bots 75-89
        1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16, 1.16,  // Tier 7: bots 90-104
        1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17, 1.17,  // Tier 8: bots 105-119
        1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18,  // Tier 9: bots 120-134
        1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20,  // Tier 10: bots 135-149
    ],
};

// =============================================================================
// TYPING REWARDS
// =============================================================================

export const TYPING_CONFIG = {
    // Base coins per post (before any multipliers)
    baseCoinsPerPost: 10,

    // How many seconds of CPS the base typing reward equals
    // coinsPerPost = max(baseCoinsPerPost, baseCPS * cpsScalingFactor) * multipliers
    cpsScalingFactor: 2,

    // Post length multiplier - longer posts give more
    // multiplier = max(1, postLength / lengthDivisor)
    lengthDivisor: 35,

    // CPS bonus added to typing reward (seconds of CPS based on WPM)
    cpsSecondsBonus: {
        base: 5,      // < 40 WPM
        wpm40: 7,     // 40-59 WPM
        wpm60: 9,     // 60-79 WPM
        wpm80: 12,    // 80-99 WPM
        wpm100: 15    // 100+ WPM
    },

    // Perfect post bonus (no errors)
    perfectBonus: {
        coinMultiplier: 1.25,
        followerMultiplier: 1.5,
        impressionMultiplier: 1.25,
        unlockAtPosts: 10
    },

    // WPM speed bonuses
    wpmBonus: {
        wpm60: { multiplier: 1.15, name: 'QUICK' },
        wpm80: { multiplier: 1.3, name: 'FAST FINGERS' },
        wpm100: { multiplier: 1.5, name: 'SPEED DEMON' },
        wpm120: { multiplier: 1.8, name: 'BLAZING SPEED' },
        unlockAtPosts: 25
    },

    // Streak bonus (consecutive posts)
    streakBonus: {
        perStreak: 0.05,    // +5% per streak
        maxMultiplier: 2,   // Cap at 2x
        unlockAtPosts: 50
    },

    // Personal best bonus
    personalBestBonus: {
        coinMultiplier: 1.5,
        followerMultiplier: 3,
        impressionMultiplier: 2,
        aboveAvgCoinMultiplier: 1.15,
        aboveAvgFollowerMultiplier: 1.5,
        unlockAtPosts: 75
    }
};

// =============================================================================
// COMBO REWARDS
// =============================================================================

export const COMBO_CONFIG = {
    // Milestones that trigger celebration
    milestones: [25, 50, 100, 200, 500],

    // Reward formula: combo * coinsPerPost * multiplier
    rewardMultiplier: 0.02,

    // Minimum reward: combo * minimumPerLevel
    minimumPerLevel: 2
};

// =============================================================================
// GOLDEN CHARACTER REWARDS
// =============================================================================

export const GOLDEN_CONFIG = {
    // Chance for a golden character to appear (0-1)
    spawnChance: 0.10,

    // Minimum posts before golden chars can appear
    unlockAtPosts: 30,

    // Single golden character reward: max(minReward, CPS * cpsSeconds)
    singleCpsSeconds: 1.5,  // 1.5 seconds of passive income
    singleMinimum: 20,

    // All-golden event reward per character: max(minReward, CPS * cpsSeconds)
    allGoldenCpsSeconds: 0.5,  // 0.5 seconds of passive income per char
    allGoldenMinimum: 3
};

// =============================================================================
// BALLOON POP REWARDS
// =============================================================================

export const BALLOON_CONFIG = {
    // Posts required before balloon unlocks
    unlockAtPosts: 20,

    // Random threshold range for balloon pop (posts in cycle)
    popThresholdMin: 8,
    popThresholdMax: 12,

    // Coin reward: max(minimumCoins, CPS * cpsSeconds) * bonusMultiplier
    cpsSeconds: 30,      // 30 seconds of passive income
    minimumCoins: 50,

    // Bonus multiplier grows with lifetime posts
    // multiplier = 1 + floor(lifetimePosts / postsPerBonus) * bonusPerTier
    postsPerBonus: 100,
    bonusPerTier: 0.25,  // +25% per 100 posts

    // Follower reward: baseAmount + sqrt(followers) * scale
    followerScale: 0.1,  // 10% of sqrt(followers)
    followerMinimum: 5
};

// =============================================================================
// VIRAL POST CHANCES & REWARDS
// =============================================================================

export const VIRAL_CONFIG = {
    // Posts required before viral can trigger
    unlockAtPosts: 50,

    // Pity system: increased chance per post without viral
    pityBonusPerPost: 0.005,

    // Viral tiers (checked from highest to lowest)
    tiers: {
        mainCharacter: {
            baseChance: 0.001,
            pityMultiplier: 0.1,
            coinMultiplier: 100,
            impressionMultiplier: 500,
            particles: 100,
            name: 'MAIN CHARACTER'
        },
        superViral: {
            baseChance: 0.005,
            pityMultiplier: 0.5,
            coinMultiplier: 50,
            impressionMultiplier: 200,
            particles: 60,
            name: 'SUPER VIRAL'
        },
        viral: {
            baseChance: 0.03,
            pityMultiplier: 1,
            coinMultiplier: 10,
            impressionMultiplier: 50,
            particles: 30,
            name: 'VIRAL'
        },
        miniViral: {
            baseChance: 0.10,
            pityMultiplier: 2,
            coinMultiplier: 2,
            impressionMultiplier: 5,
            particles: 15,
            name: 'Mini-viral'
        }
    }
};

// =============================================================================
// FOLLOWER MULTIPLIER
// =============================================================================

export const FOLLOWER_CONFIG = {
    // Formula: 1 + sqrt(followers) / divisor
    // Higher divisor = slower scaling
    sqrtDivisor: 30

    // Examples with divisor 30:
    // 0 followers = 1x
    // 1000 followers = ~2x
    // 10000 followers = ~4.3x
    // 100000 followers = ~11.5x
    // 1000000 followers = ~34x
};

// =============================================================================
// OFFLINE EARNINGS
// =============================================================================

export const OFFLINE_CONFIG = {
    // Maximum offline time counted (in seconds)
    maxOfflineSeconds: 2 * 60 * 60,  // 2 hours

    // Efficiency multiplier for offline earnings
    efficiency: 0.5  // 50%
};

// =============================================================================
// CRITICAL HIT SYSTEM
// =============================================================================

export const CRIT_CONFIG = {
    // Base chance for a critical hit (0-1)
    baseChance: 0.025,  // 2.5% base chance (reduced)

    // Multiplier range for critical hits
    minMultiplier: 3,
    maxMultiplier: 8,

    // Unlock after this many posts
    unlockAtPosts: 15,

    // Crit reward scales with CPS: max(minReward, CPS * cpsSeconds)
    cpsSeconds: 2,      // 2 seconds of passive income per crit
    minReward: 5,       // Minimum crit reward

    // Crit chance increases with combo (bonus per 50 combo)
    comboBonusPer50: 0.015,  // +1.5% per 50 combo
    maxComboBonus: 0.075     // Cap at +7.5% bonus (total max ~10% with combo)
};

// =============================================================================
// FRENZY MODE SYSTEM
// =============================================================================

export const FRENZY_CONFIG = {
    // Unlock after this many posts
    unlockAtPosts: 40,

    // Meter settings
    maxMeter: 100,
    meterGainPerChar: 1.5,      // Gain per character typed
    meterDecayPerSecond: 5,     // Decay when not typing

    // Frenzy duration and bonuses
    duration: 15000,            // 15 seconds of frenzy
    coinMultiplier: 3,          // 3x coins during frenzy
    followerMultiplier: 2,      // 2x followers during frenzy
    critChanceBonus: 0.15,      // +15% crit chance during frenzy

    // Cooldown after frenzy ends before meter can build again
    cooldown: 10000             // 10 second cooldown
};

// =============================================================================
// DAILY SPIN WHEEL
// =============================================================================

export const SPIN_CONFIG = {
    // Cooldown between spins (1 hour in milliseconds)
    spinCooldownMs: 60 * 60 * 1000,

    // Prizes scale with CPS (seconds of passive income)
    // Follower prizes scale with sqrt of current followers
    prizes: [
        { label: 'Nice Coins', weight: 20, type: 'coins', cpsSeconds: 30, minCoins: 50, icon: '🪙' },
        { label: 'Good Coins', weight: 18, type: 'coins', cpsSeconds: 60, minCoins: 100, icon: '💰' },
        { label: 'Great Coins', weight: 12, type: 'coins', cpsSeconds: 120, minCoins: 200, icon: '💎' },
        { label: 'Some Followers', weight: 15, type: 'followers', baseAmount: 10, followerScale: 0.05, icon: '👤' },
        { label: 'Many Followers', weight: 8, type: 'followers', baseAmount: 25, followerScale: 0.1, icon: '👥' },
        { label: '2x Next Post', weight: 12, type: 'buff', buff: 'nextPost2x', icon: '⚡' },
        { label: '5x Next Post', weight: 5, type: 'buff', buff: 'nextPost5x', icon: '🔥' },
        { label: 'Instant Frenzy', weight: 6, type: 'buff', buff: 'instantFrenzy', icon: '🌪️' },
        { label: 'HUGE COINS', weight: 3, type: 'coins', cpsSeconds: 300, minCoins: 500, icon: '💵' },
        { label: 'MEGA JACKPOT', weight: 1, type: 'coins', cpsSeconds: 600, minCoins: 1000, icon: '🎰' }
    ]
};

// =============================================================================
// MISCELLANEOUS
// =============================================================================

export const MISC_CONFIG = {
    // Base impressions per post
    baseImpressionsPerPost: 10,

    // Base followers gained per post
    baseFollowersPerPost: 1,

    // XP per post (for rank system)
    xpPerPost: 10,

    // Auto-save interval (milliseconds)
    autoSaveInterval: 30000,

    // Idle impression rate (% of followers that generate impressions per second)
    idleImpressionRate: 0.001  // 0.1% of followers per second
};
