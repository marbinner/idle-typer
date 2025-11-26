/**
 * Achievements Data
 * Defines all possible achievements in the game
 */

export const ACHIEVEMENTS = {
    // === First Milestones ===
    firstPost: {
        id: 'firstPost',
        name: 'Hello World',
        description: 'Complete your first post',
        icon: '📝',
        category: 'milestones',
        check: (state) => state.totalPosts >= 1
    },
    firstFollower: {
        id: 'firstFollower',
        name: 'First Fan',
        description: 'Gain your first follower',
        icon: '👤',
        category: 'milestones',
        check: (state) => state.followers >= 1
    },
    firstBot: {
        id: 'firstBot',
        name: 'Automation Begins',
        description: 'Purchase your first bot',
        icon: '🤖',
        category: 'milestones',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 1
    },
    firstUpgrade: {
        id: 'firstUpgrade',
        name: 'Self Improvement',
        description: 'Purchase your first upgrade',
        icon: '⬆️',
        category: 'milestones',
        check: (state) => Object.values(state.upgrades || {}).reduce((a, b) => a + b, 0) >= 1
    },
    firstViral: {
        id: 'firstViral',
        name: 'Going Viral',
        description: 'Get your first viral post',
        icon: '🔥',
        category: 'milestones',
        check: (state) => state.viralPosts >= 1
    },

    // === Follower Milestones ===
    followers10: {
        id: 'followers10',
        name: 'Small Following',
        description: 'Reach 10 followers',
        icon: '👥',
        category: 'followers',
        check: (state) => state.followers >= 10
    },
    followers100: {
        id: 'followers100',
        name: 'Getting Noticed',
        description: 'Reach 100 followers',
        icon: '📢',
        category: 'followers',
        check: (state) => state.followers >= 100
    },
    followers1K: {
        id: 'followers1K',
        name: 'Rising Star',
        description: 'Reach 1,000 followers',
        icon: '⭐',
        category: 'followers',
        check: (state) => state.followers >= 1000
    },
    followers10K: {
        id: 'followers10K',
        name: 'Micro Influencer',
        description: 'Reach 10,000 followers',
        icon: '🌟',
        category: 'followers',
        check: (state) => state.followers >= 10000
    },
    followers100K: {
        id: 'followers100K',
        name: 'Influencer Status',
        description: 'Reach 100,000 followers',
        icon: '💫',
        category: 'followers',
        check: (state) => state.followers >= 100000
    },
    followers1M: {
        id: 'followers1M',
        name: 'Mega Influencer',
        description: 'Reach 1,000,000 followers',
        icon: '👑',
        category: 'followers',
        check: (state) => state.followers >= 1000000
    },

    // === Coin Milestones ===
    coins100: {
        id: 'coins100',
        name: 'Pocket Change',
        description: 'Earn 100 lifetime coins',
        icon: '🪙',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 100
    },
    coins1K: {
        id: 'coins1K',
        name: 'Saving Up',
        description: 'Earn 1,000 lifetime coins',
        icon: '💰',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 1000
    },
    coins10K: {
        id: 'coins10K',
        name: 'Wealthy Creator',
        description: 'Earn 10,000 lifetime coins',
        icon: '💎',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 10000
    },
    coins100K: {
        id: 'coins100K',
        name: 'Content Mogul',
        description: 'Earn 100,000 lifetime coins',
        icon: '🏆',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 100000
    },
    coins1M: {
        id: 'coins1M',
        name: 'Crypto Millionaire',
        description: 'Earn 1,000,000 lifetime coins',
        icon: '🎰',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 1000000
    },
    coins10M: {
        id: 'coins10M',
        name: 'Digital Empire',
        description: 'Earn 10,000,000 lifetime coins',
        icon: '🏰',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 10000000
    },

    // === Post Milestones ===
    posts10: {
        id: 'posts10',
        name: 'Getting Started',
        description: 'Complete 10 posts',
        icon: '📄',
        category: 'posts',
        check: (state) => state.totalPosts >= 10
    },
    posts50: {
        id: 'posts50',
        name: 'Regular Poster',
        description: 'Complete 50 posts',
        icon: '📑',
        category: 'posts',
        check: (state) => state.totalPosts >= 50
    },
    posts100: {
        id: 'posts100',
        name: 'Content Machine',
        description: 'Complete 100 posts',
        icon: '📚',
        category: 'posts',
        check: (state) => state.totalPosts >= 100
    },
    posts500: {
        id: 'posts500',
        name: 'Prolific Poster',
        description: 'Complete 500 posts',
        icon: '📖',
        category: 'posts',
        check: (state) => state.totalPosts >= 500
    },
    posts1000: {
        id: 'posts1000',
        name: 'Posting Legend',
        description: 'Complete 1,000 posts',
        icon: '🗂️',
        category: 'posts',
        check: (state) => state.totalPosts >= 1000
    },

    // === Best WPM Achievements ===
    wpm50: {
        id: 'wpm50',
        name: 'Decent Speed',
        description: 'Reach 50 WPM on a post',
        icon: '⌨️',
        category: 'typing',
        check: (state) => state.bestWPM >= 50
    },
    wpm75: {
        id: 'wpm75',
        name: 'Fast Fingers',
        description: 'Reach 75 WPM on a post',
        icon: '🖐️',
        category: 'typing',
        check: (state) => state.bestWPM >= 75
    },
    wpm100: {
        id: 'wpm100',
        name: 'Speed Demon',
        description: 'Reach 100 WPM on a post',
        icon: '💨',
        category: 'typing',
        check: (state) => state.bestWPM >= 100
    },
    wpm125: {
        id: 'wpm125',
        name: 'Lightning Fingers',
        description: 'Reach 125 WPM on a post',
        icon: '⚡',
        category: 'typing',
        check: (state) => state.bestWPM >= 125
    },
    wpm150: {
        id: 'wpm150',
        name: 'Typing God',
        description: 'Reach 150 WPM on a post',
        icon: '🌩️',
        category: 'typing',
        check: (state) => state.bestWPM >= 150
    },
    wpm175: {
        id: 'wpm175',
        name: 'Keyboard Wizard',
        description: 'Reach 175 WPM on a post',
        icon: '🧙',
        category: 'typing',
        check: (state) => state.bestWPM >= 175
    },
    wpm200: {
        id: 'wpm200',
        name: 'Inhuman Speed',
        description: 'Reach 200 WPM on a post',
        icon: '👽',
        category: 'typing',
        check: (state) => state.bestWPM >= 200
    },

    // === Average WPM Achievements ===
    avgWpm40: {
        id: 'avgWpm40',
        name: 'Consistent Typer',
        description: 'Maintain 40 average WPM',
        icon: '📊',
        category: 'typing',
        check: (state) => state.avgWPM >= 40
    },
    avgWpm60: {
        id: 'avgWpm60',
        name: 'Reliable Speed',
        description: 'Maintain 60 average WPM',
        icon: '📈',
        category: 'typing',
        check: (state) => state.avgWPM >= 60
    },
    avgWpm80: {
        id: 'avgWpm80',
        name: 'Consistently Fast',
        description: 'Maintain 80 average WPM',
        icon: '🎯',
        category: 'typing',
        check: (state) => state.avgWPM >= 80
    },
    avgWpm100: {
        id: 'avgWpm100',
        name: 'Pro Typist',
        description: 'Maintain 100 average WPM',
        icon: '🏆',
        category: 'typing',
        check: (state) => state.avgWPM >= 100
    },
    avgWpm120: {
        id: 'avgWpm120',
        name: 'Elite Typist',
        description: 'Maintain 120 average WPM',
        icon: '💎',
        category: 'typing',
        check: (state) => state.avgWPM >= 120
    },
    avgWpm140: {
        id: 'avgWpm140',
        name: 'Typing Machine',
        description: 'Maintain 140 average WPM',
        icon: '🤖',
        category: 'typing',
        check: (state) => state.avgWPM >= 140
    },

    // === Combo Achievements ===
    combo25: {
        id: 'combo25',
        name: 'Getting Warmed Up',
        description: 'Reach a 25 combo',
        icon: '🔢',
        category: 'typing',
        check: (state) => state.bestCombo >= 25
    },
    combo50: {
        id: 'combo50',
        name: 'On A Roll',
        description: 'Reach a 50 combo',
        icon: '🎯',
        category: 'typing',
        check: (state) => state.bestCombo >= 50
    },
    combo100: {
        id: 'combo100',
        name: 'Combo Master',
        description: 'Reach a 100 combo',
        icon: '🏅',
        category: 'typing',
        check: (state) => state.bestCombo >= 100
    },
    combo200: {
        id: 'combo200',
        name: 'Unstoppable',
        description: 'Reach a 200 combo',
        icon: '🥇',
        category: 'typing',
        check: (state) => state.bestCombo >= 200
    },

    // === Perfect Posts ===
    perfectPost: {
        id: 'perfectPost',
        name: 'Flawless',
        description: 'Complete a post with 100% accuracy',
        icon: '✨',
        category: 'typing',
        check: (state) => state.perfectPosts >= 1
    },
    perfectPosts10: {
        id: 'perfectPosts10',
        name: 'Perfectionist',
        description: 'Complete 10 perfect posts',
        icon: '💯',
        category: 'typing',
        check: (state) => state.perfectPosts >= 10
    },
    perfectPosts50: {
        id: 'perfectPosts50',
        name: 'Precision Expert',
        description: 'Complete 50 perfect posts',
        icon: '🎖️',
        category: 'typing',
        check: (state) => state.perfectPosts >= 50
    },

    // === Viral Achievements ===
    viralPosts5: {
        id: 'viralPosts5',
        name: 'Trending',
        description: 'Get 5 viral posts',
        icon: '📈',
        category: 'viral',
        check: (state) => state.viralPosts >= 5
    },
    viralPosts25: {
        id: 'viralPosts25',
        name: 'Viral Sensation',
        description: 'Get 25 viral posts',
        icon: '🚀',
        category: 'viral',
        check: (state) => state.viralPosts >= 25
    },
    viralPosts100: {
        id: 'viralPosts100',
        name: 'Internet Famous',
        description: 'Get 100 viral posts',
        icon: '🌐',
        category: 'viral',
        check: (state) => state.viralPosts >= 100
    },

    // === Bot Army ===
    bots10: {
        id: 'bots10',
        name: 'Small Squad',
        description: 'Own 10 total bots',
        icon: '🤖',
        category: 'automation',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 10
    },
    bots50: {
        id: 'bots50',
        name: 'Bot Battalion',
        description: 'Own 50 total bots',
        icon: '🦾',
        category: 'automation',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 50
    },
    bots100: {
        id: 'bots100',
        name: 'Robot Army',
        description: 'Own 100 total bots',
        icon: '🏭',
        category: 'automation',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 100
    },

    // === Premium ===
    getPremium: {
        id: 'getPremium',
        name: 'Verified',
        description: 'Get X Premium',
        icon: '✓',
        category: 'premium',
        check: (state) => state.hasXPremium
    },
    getGoldCheck: {
        id: 'getGoldCheck',
        name: 'Gold Standard',
        description: 'Get Gold Verification',
        icon: '🥇',
        category: 'premium',
        check: (state) => state.verificationTier === 'gold' || state.verificationTier === 'gray'
    },
    getGrayCheck: {
        id: 'getGrayCheck',
        name: 'Government Official',
        description: 'Get Gray Verification',
        icon: '🏛️',
        category: 'premium',
        check: (state) => state.verificationTier === 'gray'
    },

    // === CPS Milestones ===
    cps10: {
        id: 'cps10',
        name: 'Passive Income',
        description: 'Reach 10 coins per second',
        icon: '💵',
        category: 'automation',
        check: (state) => state.coinsPerSecond >= 10
    },
    cps100: {
        id: 'cps100',
        name: 'Money Printer',
        description: 'Reach 100 coins per second',
        icon: '🖨️',
        category: 'automation',
        check: (state) => state.coinsPerSecond >= 100
    },
    cps1000: {
        id: 'cps1000',
        name: 'Revenue Stream',
        description: 'Reach 1,000 coins per second',
        icon: '🌊',
        category: 'automation',
        check: (state) => state.coinsPerSecond >= 1000
    },
    cps10000: {
        id: 'cps10000',
        name: 'Infinite Money',
        description: 'Reach 10,000 coins per second',
        icon: '♾️',
        category: 'automation',
        check: (state) => state.coinsPerSecond >= 10000
    },
    cps100000: {
        id: 'cps100000',
        name: 'Money Tsunami',
        description: 'Reach 100,000 coins per second',
        icon: '🌀',
        category: 'automation',
        check: (state) => state.coinsPerSecond >= 100000
    },

    // === Impression Milestones ===
    impressions1K: {
        id: 'impressions1K',
        name: 'Getting Views',
        description: 'Reach 1,000 impressions',
        icon: '👁️',
        category: 'viral',
        check: (state) => state.totalImpressions >= 1000
    },
    impressions10K: {
        id: 'impressions10K',
        name: 'Visible',
        description: 'Reach 10,000 impressions',
        icon: '👀',
        category: 'viral',
        check: (state) => state.totalImpressions >= 10000
    },
    impressions100K: {
        id: 'impressions100K',
        name: 'Eyeballs',
        description: 'Reach 100,000 impressions',
        icon: '🔭',
        category: 'viral',
        check: (state) => state.totalImpressions >= 100000
    },
    impressions1M: {
        id: 'impressions1M',
        name: 'Million Views',
        description: 'Reach 1,000,000 impressions',
        icon: '📺',
        category: 'viral',
        check: (state) => state.totalImpressions >= 1000000
    },
    impressions10M: {
        id: 'impressions10M',
        name: 'Going Mainstream',
        description: 'Reach 10,000,000 impressions',
        icon: '📡',
        category: 'viral',
        check: (state) => state.totalImpressions >= 10000000
    },

    // === Streak Achievements ===
    streak5: {
        id: 'streak5',
        name: 'Warming Up',
        description: 'Complete 5 posts in a row',
        icon: '🔥',
        category: 'streaks',
        check: (state) => state.streak >= 5
    },
    streak10: {
        id: 'streak10',
        name: 'Hot Streak',
        description: 'Complete 10 posts in a row',
        icon: '🌡️',
        category: 'streaks',
        check: (state) => state.streak >= 10
    },
    streak25: {
        id: 'streak25',
        name: 'On Fire',
        description: 'Complete 25 posts in a row',
        icon: '🔥',
        category: 'streaks',
        check: (state) => state.streak >= 25
    },
    streak50: {
        id: 'streak50',
        name: 'Blazing',
        description: 'Complete 50 posts in a row',
        icon: '🌋',
        category: 'streaks',
        check: (state) => state.streak >= 50
    },
    streak100: {
        id: 'streak100',
        name: 'Unstoppable Force',
        description: 'Complete 100 posts in a row',
        icon: '☄️',
        category: 'streaks',
        check: (state) => state.streak >= 100
    },

    // === More Follower Milestones ===
    followers5M: {
        id: 'followers5M',
        name: 'Celebrity',
        description: 'Reach 5,000,000 followers',
        icon: '🌟',
        category: 'followers',
        check: (state) => state.followers >= 5000000
    },
    followers10M: {
        id: 'followers10M',
        name: 'Superstar',
        description: 'Reach 10,000,000 followers',
        icon: '🌠',
        category: 'followers',
        check: (state) => state.followers >= 10000000
    },
    followers50M: {
        id: 'followers50M',
        name: 'World Famous',
        description: 'Reach 50,000,000 followers',
        icon: '🌍',
        category: 'followers',
        check: (state) => state.followers >= 50000000
    },
    followers100M: {
        id: 'followers100M',
        name: 'Most Followed',
        description: 'Reach 100,000,000 followers',
        icon: '👑',
        category: 'followers',
        check: (state) => state.followers >= 100000000
    },

    // === More Coin Milestones ===
    coins100M: {
        id: 'coins100M',
        name: 'Billionaire Mindset',
        description: 'Earn 100,000,000 lifetime coins',
        icon: '🏦',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 100000000
    },
    coins1B: {
        id: 'coins1B',
        name: 'Crypto Whale',
        description: 'Earn 1,000,000,000 lifetime coins',
        icon: '🐋',
        category: 'wealth',
        check: (state) => state.lifetimeCoins >= 1000000000
    },

    // === More Post Milestones ===
    posts2500: {
        id: 'posts2500',
        name: 'Content Factory',
        description: 'Complete 2,500 posts',
        icon: '🏭',
        category: 'posts',
        check: (state) => state.totalPosts >= 2500
    },
    posts5000: {
        id: 'posts5000',
        name: 'Posting Addict',
        description: 'Complete 5,000 posts',
        icon: '💉',
        category: 'posts',
        check: (state) => state.totalPosts >= 5000
    },
    posts10000: {
        id: 'posts10000',
        name: 'Post Supremacy',
        description: 'Complete 10,000 posts',
        icon: '🗿',
        category: 'posts',
        check: (state) => state.totalPosts >= 10000
    },

    // === More Perfect Posts ===
    perfectPosts100: {
        id: 'perfectPosts100',
        name: 'Accuracy King',
        description: 'Complete 100 perfect posts',
        icon: '🎯',
        category: 'typing',
        check: (state) => state.perfectPosts >= 100
    },
    perfectPosts250: {
        id: 'perfectPosts250',
        name: 'Zero Mistakes',
        description: 'Complete 250 perfect posts',
        icon: '💫',
        category: 'typing',
        check: (state) => state.perfectPosts >= 250
    },
    perfectPosts500: {
        id: 'perfectPosts500',
        name: 'Flawless Legend',
        description: 'Complete 500 perfect posts',
        icon: '👼',
        category: 'typing',
        check: (state) => state.perfectPosts >= 500
    },

    // === More Combo Achievements ===
    combo500: {
        id: 'combo500',
        name: 'Combo God',
        description: 'Reach a 500 combo',
        icon: '🌟',
        category: 'typing',
        check: (state) => state.bestCombo >= 500
    },
    combo1000: {
        id: 'combo1000',
        name: 'Thousand Strike',
        description: 'Reach a 1,000 combo',
        icon: '💥',
        category: 'typing',
        check: (state) => state.bestCombo >= 1000
    },

    // === More Viral Achievements ===
    viralPosts250: {
        id: 'viralPosts250',
        name: 'Viral King',
        description: 'Get 250 viral posts',
        icon: '👑',
        category: 'viral',
        check: (state) => state.viralPosts >= 250
    },
    viralPosts500: {
        id: 'viralPosts500',
        name: 'Algorithm Master',
        description: 'Get 500 viral posts',
        icon: '🧬',
        category: 'viral',
        check: (state) => state.viralPosts >= 500
    },
    mainCharacter: {
        id: 'mainCharacter',
        name: 'Main Character',
        description: 'Get a MAIN CHARACTER viral post',
        icon: '🦸',
        category: 'viral',
        check: (state) => state.mainCharacterPosts >= 1
    },
    mainCharacter5: {
        id: 'mainCharacter5',
        name: 'Protagonist',
        description: 'Get 5 MAIN CHARACTER viral posts',
        icon: '🦹',
        category: 'viral',
        check: (state) => state.mainCharacterPosts >= 5
    },

    // === More Bot Achievements ===
    bots250: {
        id: 'bots250',
        name: 'Bot Empire',
        description: 'Own 250 total bots',
        icon: '🌐',
        category: 'automation',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 250
    },
    bots500: {
        id: 'bots500',
        name: 'Skynet',
        description: 'Own 500 total bots',
        icon: '🤖',
        category: 'automation',
        check: (state) => Object.values(state.bots || {}).reduce((a, b) => a + b, 0) >= 500
    },

    // === Secret/Fun Achievements ===
    nightOwl: {
        id: 'nightOwl',
        name: 'Night Owl',
        description: 'Play between midnight and 4 AM',
        icon: '🦉',
        category: 'secret',
        check: (state) => {
            const hour = new Date().getHours();
            return hour >= 0 && hour < 4 && state.totalPosts > 0;
        }
    },
    earlyBird: {
        id: 'earlyBird',
        name: 'Early Bird',
        description: 'Play between 5 AM and 7 AM',
        icon: '🐦',
        category: 'secret',
        check: (state) => {
            const hour = new Date().getHours();
            return hour >= 5 && hour < 7 && state.totalPosts > 0;
        }
    },
    dedicatedTyper: {
        id: 'dedicatedTyper',
        name: 'Dedicated Typer',
        description: 'Type 10,000 total characters',
        icon: '✍️',
        category: 'secret',
        check: (state) => state.totalCharsTyped >= 10000
    },
    marathonTyper: {
        id: 'marathonTyper',
        name: 'Marathon Typer',
        description: 'Type 100,000 total characters',
        icon: '🏃',
        category: 'secret',
        check: (state) => state.totalCharsTyped >= 100000
    },
    millionKeys: {
        id: 'millionKeys',
        name: 'Million Keystrokes',
        description: 'Type 1,000,000 total characters',
        icon: '⌨️',
        category: 'secret',
        check: (state) => state.totalCharsTyped >= 1000000
    },
    balanced: {
        id: 'balanced',
        name: 'Perfectly Balanced',
        description: 'Have exactly equal coins and followers',
        icon: '⚖️',
        category: 'secret',
        check: (state) => state.coins > 100 && Math.floor(state.coins) === Math.floor(state.followers)
    },
    lucky777: {
        id: 'lucky777',
        name: 'Lucky Sevens',
        description: 'Have exactly 777 of any resource',
        icon: '🎰',
        category: 'secret',
        check: (state) => Math.floor(state.coins) === 777 || Math.floor(state.followers) === 777
    },
    nice: {
        id: 'nice',
        name: 'Nice',
        description: 'Have exactly 69 of any resource',
        icon: '😏',
        category: 'secret',
        check: (state) => Math.floor(state.coins) === 69 || Math.floor(state.followers) === 69 || state.totalPosts === 69
    },
    wpmRecord5: {
        id: 'wpmRecord5',
        name: 'Record Breaker',
        description: 'Beat your average WPM 5 times in a row',
        icon: '📈',
        category: 'typing',
        check: (state) => state.wpmRecordStreak >= 5
    },
    wpmRecord10: {
        id: 'wpmRecord10',
        name: 'Consistent Improvement',
        description: 'Beat your average WPM 10 times in a row',
        icon: '🚀',
        category: 'typing',
        check: (state) => state.wpmRecordStreak >= 10
    },

    // === Balloon Pop Achievements ===
    firstPop: {
        id: 'firstPop',
        name: 'Pop!',
        description: 'Pop your first balloon',
        icon: '🎈',
        category: 'milestones',
        check: (state) => state.balloonPops >= 1
    },
    balloonPops10: {
        id: 'balloonPops10',
        name: 'Pop Star',
        description: 'Pop 10 balloons',
        icon: '🎊',
        category: 'milestones',
        check: (state) => state.balloonPops >= 10
    },
    balloonPops50: {
        id: 'balloonPops50',
        name: 'Balloon Buster',
        description: 'Pop 50 balloons',
        icon: '🎉',
        category: 'milestones',
        check: (state) => state.balloonPops >= 50
    },
    balloonPops100: {
        id: 'balloonPops100',
        name: 'Party Animal',
        description: 'Pop 100 balloons',
        icon: '🥳',
        category: 'milestones',
        check: (state) => state.balloonPops >= 100
    },

    // === Play Time Achievements ===
    playTime10m: {
        id: 'playTime10m',
        name: 'Quick Session',
        description: 'Play for 10 minutes',
        icon: '⏱️',
        category: 'secret',
        check: (state) => state.totalPlayTime >= 10 * 60 * 1000
    },
    playTime1h: {
        id: 'playTime1h',
        name: 'Hour Down',
        description: 'Play for 1 hour',
        icon: '⏰',
        category: 'secret',
        check: (state) => state.totalPlayTime >= 60 * 60 * 1000
    },
    playTime5h: {
        id: 'playTime5h',
        name: 'Dedicated Player',
        description: 'Play for 5 hours',
        icon: '🕐',
        category: 'secret',
        check: (state) => state.totalPlayTime >= 5 * 60 * 60 * 1000
    },
    playTime24h: {
        id: 'playTime24h',
        name: 'No Life',
        description: 'Play for 24 hours total',
        icon: '🌙',
        category: 'secret',
        check: (state) => state.totalPlayTime >= 24 * 60 * 60 * 1000
    },
    playTime100h: {
        id: 'playTime100h',
        name: 'Touch Grass?',
        description: 'Play for 100 hours total',
        icon: '🌿',
        category: 'secret',
        check: (state) => state.totalPlayTime >= 100 * 60 * 60 * 1000
    },

    // === Rank Achievements ===
    rankNewbie: {
        id: 'rankNewbie',
        name: 'Baby Steps',
        description: 'Reach Newbie rank',
        icon: '🐣',
        category: 'milestones',
        check: (state) => state.xp >= 100
    },
    rankPoster: {
        id: 'rankPoster',
        name: 'Making Waves',
        description: 'Reach Poster rank',
        icon: '📮',
        category: 'milestones',
        check: (state) => state.xp >= 500
    },
    rankTweeter: {
        id: 'rankTweeter',
        name: 'Getting Social',
        description: 'Reach Tweeter rank',
        icon: '🐦',
        category: 'milestones',
        check: (state) => state.xp >= 1500
    },
    rankInfluencer: {
        id: 'rankInfluencer',
        name: 'Influence Rising',
        description: 'Reach Influencer rank',
        icon: '📢',
        category: 'milestones',
        check: (state) => state.xp >= 5000
    },
    rankCeleb: {
        id: 'rankCeleb',
        name: 'A-List',
        description: 'Reach Celebrity rank',
        icon: '⭐',
        category: 'milestones',
        check: (state) => state.xp >= 15000
    },
    rankLegend: {
        id: 'rankLegend',
        name: 'Legendary Status',
        description: 'Reach Legend rank',
        icon: '🏆',
        category: 'milestones',
        check: (state) => state.xp >= 50000
    },

    // === Heat/Streak Related ===
    heatHot: {
        id: 'heatHot',
        name: 'Heating Up',
        description: 'Reach HOT heat level',
        icon: '🔥',
        category: 'streaks',
        check: (state) => state.heat >= 50
    },
    heatOnFire: {
        id: 'heatOnFire',
        name: 'On Fire!',
        description: 'Reach ON FIRE heat level',
        icon: '🌶️',
        category: 'streaks',
        check: (state) => state.heat >= 75
    },
    heatMax: {
        id: 'heatMax',
        name: 'Maximum Heat',
        description: 'Reach maximum heat level',
        icon: '☀️',
        category: 'streaks',
        check: (state) => state.heat >= 100
    },

    // === Golden Character Achievements ===
    goldenChar1: {
        id: 'goldenChar1',
        name: 'Golden Touch',
        description: 'Hit your first golden character',
        icon: '✨',
        category: 'secret',
        check: (state) => state.goldenCharsHit >= 1
    },
    goldenChar25: {
        id: 'goldenChar25',
        name: 'Gold Digger',
        description: 'Hit 25 golden characters',
        icon: '💛',
        category: 'secret',
        check: (state) => state.goldenCharsHit >= 25
    },
    goldenChar100: {
        id: 'goldenChar100',
        name: 'Golden Fingers',
        description: 'Hit 100 golden characters',
        icon: '🏅',
        category: 'secret',
        check: (state) => state.goldenCharsHit >= 100
    },
    goldenChar500: {
        id: 'goldenChar500',
        name: 'Midas Touch',
        description: 'Hit 500 golden characters',
        icon: '👑',
        category: 'secret',
        check: (state) => state.goldenCharsHit >= 500
    },

    // === Speed Achievements ===
    speedrun10: {
        id: 'speedrun10',
        name: 'Speedrunner',
        description: 'Complete 10 posts in 5 minutes',
        icon: '⚡',
        category: 'secret',
        check: (state) => state.speedrunPosts >= 10
    },
    doubleDigitCPS: {
        id: 'doubleDigitCPS',
        name: 'Double Digits',
        description: 'Reach 10+ characters per second typing speed',
        icon: '🔢',
        category: 'typing',
        check: (state) => state.bestCPS >= 10
    },

    // === Fun/Meme Achievements ===
    posting420: {
        id: 'posting420',
        name: 'Blaze It',
        description: 'Have exactly 420 of any resource',
        icon: '🌿',
        category: 'secret',
        check: (state) => Math.floor(state.coins) === 420 || Math.floor(state.followers) === 420 || state.totalPosts === 420
    },
    elonMoment: {
        id: 'elonMoment',
        name: 'Elon Moment',
        description: 'Reach 44 billion coins (jk, 44,000 will do)',
        icon: '🚀',
        category: 'secret',
        check: (state) => state.lifetimeCoins >= 44000
    },
    ratioKing: {
        id: 'ratioKing',
        name: 'Ratio King',
        description: 'Have 10x more followers than lifetime posts',
        icon: '📊',
        category: 'secret',
        check: (state) => state.followers > 0 && state.totalPosts > 0 && state.followers >= state.totalPosts * 10
    },
    touchTyper: {
        id: 'touchTyper',
        name: 'Touch Typer',
        description: 'Complete 5 posts with 95%+ accuracy and 80+ WPM',
        icon: '🎹',
        category: 'typing',
        check: (state) => state.proTyperPosts >= 5
    },

    // === XP Achievements ===
    xp10K: {
        id: 'xp10K',
        name: 'Experience Points',
        description: 'Earn 10,000 total XP',
        icon: '📈',
        category: 'milestones',
        check: (state) => state.xp >= 10000
    },
    xp100K: {
        id: 'xp100K',
        name: 'XP Master',
        description: 'Earn 100,000 total XP',
        icon: '🎮',
        category: 'milestones',
        check: (state) => state.xp >= 100000
    },
    xp1M: {
        id: 'xp1M',
        name: 'Million XP',
        description: 'Earn 1,000,000 total XP',
        icon: '🌟',
        category: 'milestones',
        check: (state) => state.xp >= 1000000
    }
};

// Category display info
export const CATEGORIES = {
    milestones: { name: 'Milestones', icon: '🏁' },
    followers: { name: 'Followers', icon: '👥' },
    wealth: { name: 'Wealth', icon: '💰' },
    posts: { name: 'Posts', icon: '📝' },
    typing: { name: 'Typing', icon: '⌨️' },
    viral: { name: 'Viral', icon: '🔥' },
    streaks: { name: 'Streaks', icon: '🔥' },
    automation: { name: 'Automation', icon: '🤖' },
    premium: { name: 'Premium', icon: '✓' },
    secret: { name: 'Secret', icon: '🔮' }
};

/**
 * Get all achievements
 */
export function getAllAchievements() {
    return Object.values(ACHIEVEMENTS);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category) {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

/**
 * Get achievement by ID
 */
export function getAchievement(id) {
    return ACHIEVEMENTS[id] || null;
}
