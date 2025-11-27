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

    // Single golden character reward (multiplier of coinsPerPost)
    singleMultiplier: 3,
    singleMinimum: 30,

    // All-golden event reward per character (should be meaningful but less than single golden)
    // At 1.0x, a 100-char post gives 100x coinsPerPost total during golden hour
    allGoldenMultiplier: 1.0,
    allGoldenMinimum: 5
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
    cpsSeconds: 25,
    minimumCoins: 50,

    // Bonus multiplier grows with lifetime posts
    // multiplier = 1 + floor(lifetimePosts / postsPerBonus) * bonusPerTier
    postsPerBonus: 100,
    bonusPerTier: 0.2,

    // Follower reward: max(minimum, sqrt(followers) * multiplier) * bonusMultiplier
    followerMultiplier: 0.5,
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
    autoSaveInterval: 30000
};
