/**
 * Bot and Upgrade Definitions
 * Uses formula-based generation for consistent progression
 */

import { BOT_CONFIG } from '../config.js';

// Bot flavor data (names, icons, descriptions) - 150 bots across 10 tiers!
const BOT_FLAVOR = [
    // ==========================================================================
    // TIER 1 (0-14): Social Media Beginners - Basic social media personas
    // ==========================================================================
    { id: 'replyGuy', name: 'Reply Guy', icon: '🤓', description: '"Actually..." on every post' },
    { id: 'lurker', name: 'Lurker', icon: '🫣', description: 'Watches but never posts' },
    { id: 'shitposter', name: 'Shitposter', icon: '🤪', description: 'Chaos goblin energy' },
    { id: 'burnerAccount', name: 'Burner Account', icon: '🥸', description: 'Definitely not my main' },
    { id: 'ratioKing', name: 'Ratio King', icon: '📉', description: 'Lives for the L+ratio' },
    { id: 'qrtQueen', name: 'QRT Queen', icon: '👸', description: 'Quote tweets with attitude' },
    { id: 'threadBro', name: 'Thread Bro', icon: '🧵', description: '1/47 incoming...' },
    { id: 'eggAvatar', name: 'Egg Avatar', icon: '🥚', description: 'Joined 5 minutes ago' },
    { id: 'typoMaster', name: 'Typo Master', icon: '📝', description: 'Teh best spellre' },
    { id: 'subtweeter', name: 'Subtweeter', icon: '🙄', description: 'Some people just...' },
    { id: 'hashtagAddict', name: 'Hashtag Addict', icon: '#️⃣', description: '#blessed #grinding #hustle' },
    { id: 'oldAccount', name: 'Old Account', icon: '👴', description: 'Joined in 2009' },
    { id: 'doomScroller', name: 'Doom Scroller', icon: '📱', description: 'Just one more refresh...' },
    { id: 'notifChaser', name: 'Notif Chaser', icon: '🔔', description: 'Turns on all alerts' },
    { id: 'fakeFan', name: 'Fake Fan', icon: '🎭', description: 'Been a fan since day 1 (yesterday)' },

    // ==========================================================================
    // TIER 2 (15-29): Content Creators - People who make content
    // ==========================================================================
    { id: 'memeLord', name: 'Meme Lord', icon: '🐸', description: 'Based and frog-pilled' },
    { id: 'contentCreator', name: 'Content Creator', icon: '🎬', description: 'Like and subscribe!' },
    { id: 'blueCheck', name: 'Blue Check', icon: '💸', description: 'Paid $8 for clout' },
    { id: 'podcastHost', name: 'Podcast Host', icon: '🎙️', description: 'Let me tell you about my sponsor' },
    { id: 'tiktoker', name: 'TikToker', icon: '🕺', description: 'Did it for the algorithm' },
    { id: 'youtuber', name: 'YouTuber', icon: '▶️', description: 'Smash that subscribe button' },
    { id: 'streamer', name: 'Streamer', icon: '🎮', description: 'Going live in 5!' },
    { id: 'vlogger', name: 'Vlogger', icon: '📹', description: 'Follow my daily journey' },
    { id: 'artThief', name: 'Art Thief', icon: '🖼️', description: 'Found this cool art (no credit)' },
    { id: 'hotTaker', name: 'Hot Taker', icon: '🔥', description: 'Controversial opinion incoming' },
    { id: 'cloutChaser', name: 'Clout Chaser', icon: '🏃', description: 'Will do anything for views' },
    { id: 'aesthetic', name: 'Aesthetic Account', icon: '✨', description: 'Vibes only ✨' },
    { id: 'foodie', name: 'Foodie', icon: '🍜', description: 'Let me photograph my meal' },
    { id: 'fitFluencer', name: 'Fit-fluencer', icon: '💪', description: 'Day 47 of my journey' },
    { id: 'prankster', name: 'Prankster', icon: '😜', description: 'Its just a prank bro' },

    // ==========================================================================
    // TIER 3 (30-44): Platform Specialists - Niche platform experts
    // ==========================================================================
    { id: 'influencer', name: 'Influencer', icon: '🪞', description: 'Ring light enthusiast' },
    { id: 'cryptoBro', name: 'Crypto Bro', icon: '🦧', description: 'HODL and cope' },
    { id: 'grokAI', name: 'Grok AI', icon: '🧠', description: 'Hallucinating hot takes' },
    { id: 'discordMod', name: 'Discord Mod', icon: '🛡️', description: 'Power tripping since 2016' },
    { id: 'redditUser', name: 'Reddit User', icon: '🤖', description: 'This. So much this.' },
    { id: 'linkedInBro', name: 'LinkedIn Bro', icon: '👔', description: 'Agree? Thoughts?' },
    { id: 'instagrammer', name: 'Instagrammer', icon: '📸', description: 'Link in bio' },
    { id: 'snapchatter', name: 'Snapchatter', icon: '👻', description: 'Streak: 1,247 days' },
    { id: 'pinterestMom', name: 'Pinterest Mom', icon: '📌', description: 'DIY everything' },
    { id: 'tumblrVet', name: 'Tumblr Veteran', icon: '🦋', description: 'Survived the purge' },
    { id: 'twitchMod', name: 'Twitch Mod', icon: '⚔️', description: 'Bans with no remorse' },
    { id: 'stanAccount', name: 'Stan Account', icon: '💜', description: 'Will fight anyone' },
    { id: 'newsBot', name: 'News Bot', icon: '📰', description: 'BREAKING: Everything' },
    { id: 'weatherGuy', name: 'Weather Guy', icon: '🌤️', description: 'Cloudy with a chance of posts' },
    { id: 'sportsAnalyst', name: 'Sports Analyst', icon: '⚽', description: 'Actually, the stats show...' },

    // ==========================================================================
    // TIER 4 (45-59): Influencers & Celebrities - Famous personas
    // ==========================================================================
    { id: 'botFarm', name: 'Bot Farm', icon: '🤖', description: 'Beep boop I am human' },
    { id: 'elonsAlt', name: "Elon's Alt", icon: '🤡', description: 'Posts at 3am' },
    { id: 'mediaEmpire', name: 'Media Empire', icon: '👑', description: 'The algorithm fears you' },
    { id: 'celebImpersonator', name: 'Celeb Impersonator', icon: '🎪', description: 'Totally the real one' },
    { id: 'verifiedSeller', name: 'Verified Seller', icon: '✅', description: 'DM for promos' },
    { id: 'prAgent', name: 'PR Agent', icon: '🕴️', description: 'My client has no comment' },
    { id: 'gossipPage', name: 'Gossip Page', icon: '🗣️', description: 'Tea is served' },
    { id: 'cancelCulture', name: 'Cancel Culture', icon: '❌', description: 'Digging up old tweets' },
    { id: 'paparazzi', name: 'Paparazzi', icon: '📷', description: 'Caught them at Starbucks' },
    { id: 'fanPage', name: 'Fan Page', icon: '😍', description: 'Daily updates on fave' },
    { id: 'memePage', name: 'Meme Page', icon: '😂', description: '10M followers, 0 original content' },
    { id: 'brandAccount', name: 'Brand Account', icon: '🏢', description: 'Fellow kids energy' },
    { id: 'politicalBot', name: 'Political Bot', icon: '🗳️', description: 'VOTE FOR...' },
    { id: 'astroTurfer', name: 'Astro Turfer', icon: '🌿', description: 'Organic grassroots support' },
    { id: 'trollFarm', name: 'Troll Farm', icon: '🧌', description: 'Just asking questions' },

    // ==========================================================================
    // TIER 5 (60-74): Tech & Crypto - Technology enthusiasts
    // ==========================================================================
    { id: 'techBro', name: 'Tech Bro', icon: '💻', description: 'Disrupting disruption' },
    { id: 'aiEnthusiast', name: 'AI Enthusiast', icon: '🤖', description: 'AGI by Tuesday' },
    { id: 'nftArtist', name: 'NFT Artist', icon: '🖼️', description: 'Right click this' },
    { id: 'web3Evangelist', name: 'Web3 Evangelist', icon: '🕸️', description: 'WAGMI fren' },
    { id: 'bitcoinMaxi', name: 'Bitcoin Maxi', icon: '₿', description: 'Have fun staying poor' },
    { id: 'degenTrader', name: 'Degen Trader', icon: '📈', description: 'Ape in, ask questions never' },
    { id: 'rugPuller', name: 'Rug Puller', icon: '🏃‍♂️', description: 'Dev is safu (lie)' },
    { id: 'vaporwareFounder', name: 'Vaporware Founder', icon: '💨', description: 'Roadmap coming soon' },
    { id: 'hackerman', name: 'Hackerman', icon: '👨‍💻', description: 'Im in.' },
    { id: 'bugBountyHunter', name: 'Bug Bounty Hunter', icon: '🐛', description: 'Found a critical vuln' },
    { id: 'openSourceDev', name: 'Open Source Dev', icon: '🔓', description: 'MIT license everything' },
    { id: 'startupFounder', name: 'Startup Founder', icon: '🚀', description: 'Disrupting the industry' },
    { id: 'vcPartner', name: 'VC Partner', icon: '💰', description: 'Bullish on this space' },
    { id: 'dataScientist', name: 'Data Scientist', icon: '📊', description: 'The data shows...' },
    { id: 'cloudArchitect', name: 'Cloud Architect', icon: '☁️', description: 'Serverless is the future' },

    // ==========================================================================
    // TIER 6 (75-89): Media & Entertainment - Entertainment industry
    // ==========================================================================
    { id: 'movieCritic', name: 'Movie Critic', icon: '🎬', description: 'Actually, Scorsese said...' },
    { id: 'musicSnob', name: 'Music Snob', icon: '🎵', description: 'You wouldnt know them' },
    { id: 'gamingJournalist', name: 'Gaming Journalist', icon: '🎮', description: 'Too hard, 3/10' },
    { id: 'bookworm', name: 'Bookworm', icon: '📚', description: 'The book was better' },
    { id: 'animeExpert', name: 'Anime Expert', icon: '⛩️', description: 'According to the manga...' },
    { id: 'kpopStan', name: 'K-Pop Stan', icon: '💜', description: 'Stream the new MV' },
    { id: 'concertGoer', name: 'Concert Goer', icon: '🎤', description: 'I was at that show' },
    { id: 'djProducer', name: 'DJ Producer', icon: '🎧', description: 'New track dropping soon' },
    { id: 'filmStudent', name: 'Film Student', icon: '🎞️', description: 'Its cinema, not movies' },
    { id: 'tvRecapper', name: 'TV Recapper', icon: '📺', description: 'Episode thread incoming' },
    { id: 'comicNerd', name: 'Comic Nerd', icon: '🦸', description: 'In the comics, actually...' },
    { id: 'cosplayer', name: 'Cosplayer', icon: '👘', description: 'Con pics dropping' },
    { id: 'voiceActor', name: 'Voice Actor', icon: '🎭', description: 'I do voices' },
    { id: 'screenwriter', name: 'Screenwriter', icon: '✍️', description: 'Working on a script' },
    { id: 'talentAgent', name: 'Talent Agent', icon: '📋', description: 'My people will call' },

    // ==========================================================================
    // TIER 7 (90-104): Corporate & Business - Business personas
    // ==========================================================================
    { id: 'ceo', name: 'CEO', icon: '👔', description: 'Leadership is a journey' },
    { id: 'hrManager', name: 'HR Manager', icon: '📁', description: 'Lets circle back' },
    { id: 'marketingGuru', name: 'Marketing Guru', icon: '📣', description: 'Growth hacking expert' },
    { id: 'salesBro', name: 'Sales Bro', icon: '🤝', description: 'Crushing quotas' },
    { id: 'consultantChad', name: 'Consultant Chad', icon: '📊', description: 'Per my last email...' },
    { id: 'projectManager', name: 'Project Manager', icon: '📋', description: 'Lets sync up' },
    { id: 'scrum Master', name: 'Scrum Master', icon: '🔄', description: 'Agile transformation' },
    { id: 'dataAnalyst', name: 'Data Analyst', icon: '📈', description: 'Insights incoming' },
    { id: 'uxDesigner', name: 'UX Designer', icon: '🎨', description: 'Think about the user' },
    { id: 'productManager', name: 'Product Manager', icon: '🗺️', description: 'Roadmap season' },
    { id: 'accountant', name: 'Accountant', icon: '🧮', description: 'Let me run the numbers' },
    { id: 'lawyer', name: 'Lawyer', icon: '⚖️', description: 'Not legal advice but...' },
    { id: 'recruiter', name: 'Recruiter', icon: '🔍', description: 'Open to work?' },
    { id: 'cfo', name: 'CFO', icon: '💵', description: 'Maximizing shareholder value' },
    { id: 'boardMember', name: 'Board Member', icon: '🏛️', description: 'Fiduciary duty' },

    // ==========================================================================
    // TIER 8 (105-119): Mythical & Legendary - Fantasy creatures
    // ==========================================================================
    { id: 'internetWizard', name: 'Internet Wizard', icon: '🧙', description: 'Casting viral spells' },
    { id: 'trollKing', name: 'Troll King', icon: '👹', description: 'Maximum chaos achieved' },
    { id: 'memeGoblin', name: 'Meme Goblin', icon: '👺', description: 'Hoarding rare memes' },
    { id: 'viralPhoenix', name: 'Viral Phoenix', icon: '🔥', description: 'Rises from cancelled ashes' },
    { id: 'algorithmDragon', name: 'Algorithm Dragon', icon: '🐉', description: 'Controls the feed' },
    { id: 'cloutVampire', name: 'Clout Vampire', icon: '🧛', description: 'Feeds on engagement' },
    { id: 'contentWraith', name: 'Content Wraith', icon: '👻', description: 'Haunts your timeline' },
    { id: 'followWerewolf', name: 'Follower Wolf', icon: '🐺', description: 'Howls for followers' },
    { id: 'viralUnicorn', name: 'Viral Unicorn', icon: '🦄', description: 'Rare and magical' },
    { id: 'engagementGolem', name: 'Engagement Golem', icon: '🗿', description: 'Built from pure likes' },
    { id: 'retweetSpecter', name: 'Retweet Specter', icon: '👤', description: 'Silently boosts all' },
    { id: 'hashtagHydra', name: 'Hashtag Hydra', icon: '🐲', description: 'Cut one, two more appear' },
    { id: 'trendTitan', name: 'Trend Titan', icon: '⚡', description: 'Creates trends at will' },
    { id: 'contentCyclops', name: 'Content Cyclops', icon: '👁️', description: 'One eye on all posts' },
    { id: 'viralValkyrie', name: 'Viral Valkyrie', icon: '🦅', description: 'Carries posts to glory' },

    // ==========================================================================
    // TIER 9 (120-134): Cosmic & Divine - Space and godlike beings
    // ==========================================================================
    { id: 'digitalGod', name: 'Digital God', icon: '👁️‍🗨️', description: 'I see all your posts' },
    { id: 'cosmicInfluencer', name: 'Cosmic Influencer', icon: '🌌', description: 'Followers across galaxies' },
    { id: 'timelineLord', name: 'Timeline Lord', icon: '⏰', description: 'Controls past and future posts' },
    { id: 'quantumPoster', name: 'Quantum Poster', icon: '⚛️', description: 'Posts in all timelines' },
    { id: 'voidEntity', name: 'Void Entity', icon: '🕳️', description: 'Posts from the abyss' },
    { id: 'starforgedBot', name: 'Starforged Bot', icon: '⭐', description: 'Born from supernovae' },
    { id: 'nebulaMind', name: 'Nebula Mind', icon: '🌫️', description: 'Thoughts span lightyears' },
    { id: 'solarFlare', name: 'Solar Flare', icon: '☀️', description: 'Posts that burn' },
    { id: 'blackHoleAccount', name: 'Black Hole Account', icon: '🌑', description: 'Infinite engagement density' },
    { id: 'galaxyBrain', name: 'Galaxy Brain', icon: '🧠', description: 'Transcendent takes' },
    { id: 'cosmicOracle', name: 'Cosmic Oracle', icon: '🔮', description: 'Predicts all trends' },
    { id: 'stellarArchon', name: 'Stellar Archon', icon: '✨', description: 'Commands star systems' },
    { id: 'dimensionWalker', name: 'Dimension Walker', icon: '🌀', description: 'Posts across realities' },
    { id: 'eternityWatcher', name: 'Eternity Watcher', icon: '👀', description: 'Witnesses all engagement' },
    { id: 'celestialAdmin', name: 'Celestial Admin', icon: '🛸', description: 'Moderates the universe' },

    // ==========================================================================
    // TIER 10 (135-149): Reality-Breaking - Universe-altering entities
    // ==========================================================================
    { id: 'realityWarper', name: 'Reality Warper', icon: '🌀', description: 'Your posts break spacetime' },
    { id: 'infiniteScroll', name: 'Infinite Scroll', icon: '♾️', description: 'Endless engagement' },
    { id: 'omniposter', name: 'Omniposter', icon: '🌐', description: 'Posts everywhere at once' },
    { id: 'primordialMeme', name: 'Primordial Meme', icon: '🦠', description: 'The first meme ever' },
    { id: 'entropyEngine', name: 'Entropy Engine', icon: '💀', description: 'All posts end here' },
    { id: 'creationForge', name: 'Creation Forge', icon: '🔨', description: 'Manifests content from void' },
    { id: 'absoluteUnit', name: 'Absolute Unit', icon: '🗿', description: 'In awe at the size' },
    { id: 'singularity', name: 'Singularity', icon: '💫', description: 'All posts converge here' },
    { id: 'metaverseArchitect', name: 'Metaverse Architect', icon: '🏗️', description: 'Builds digital realities' },
    { id: 'timelineCollapse', name: 'Timeline Collapse', icon: '⌛', description: 'Past future all at once' },
    { id: 'universalBot', name: 'Universal Bot', icon: '🌍', description: 'Operates in all dimensions' },
    { id: 'godTierPoster', name: 'God Tier Poster', icon: '🏆', description: 'Maximum ascension achieved' },
    { id: 'existentialMeme', name: 'Existential Meme', icon: '🤯', description: 'Posts that question reality' },
    { id: 'alphaOmega', name: 'Alpha & Omega', icon: 'Ω', description: 'First and last post' },
    { id: 'theAlgorithm', name: 'THE ALGORITHM', icon: '👁️', description: 'You dont control it. It controls you.' },
];

/**
 * Generate bot stats using formulas
 */
function generateBotStats(index) {
    const config = BOT_CONFIG;

    // Calculate cost scaling factor (decreases from costScaleStart to costScaleEnd)
    const scaleProgress = Math.pow(config.costScaleDecay, index);
    const costScale = config.costScaleEnd + (config.costScaleStart - config.costScaleEnd) * scaleProgress;

    // Calculate base cost
    let baseCost;
    if (index === 0) {
        baseCost = config.firstBotCost;
    } else {
        // Get previous bot's cost and multiply by scaling factor
        const prevCost = generateBotStats(index - 1).baseCost;
        baseCost = Math.round(prevCost * costScale);
    }

    // Calculate CPS based on target ROI
    const targetROI = config.baseROI * Math.pow(config.roiGrowth, index);
    const cps = baseCost / targetROI;

    // Get cost multiplier for this bot's tier
    const costMult = config.tierCostMults[Math.min(index, config.tierCostMults.length - 1)];

    // Round CPS to reasonable precision
    const roundedCPS = cps < 1 ? Math.round(cps * 100) / 100 :
                       cps < 100 ? Math.round(cps * 10) / 10 :
                       Math.round(cps);

    return {
        baseCost,
        costMult,
        cps: roundedCPS,
        unlockAt: index === 0 ? 0 : baseCost  // First bot unlocked immediately
    };
}

/**
 * Generate all bots by combining flavor data with calculated stats
 */
function generateBots() {
    const bots = {};

    BOT_FLAVOR.forEach((flavor, index) => {
        const stats = generateBotStats(index);
        bots[flavor.id] = {
            id: flavor.id,
            name: flavor.name,
            icon: flavor.icon,
            description: flavor.description,
            ...stats
        };
    });

    return bots;
}

// Generate bots using formulas
export const BOTS = generateBots();

// Log generated values for debugging/tuning
console.log('Generated bot stats:', Object.entries(BOTS).map(([id, bot]) => ({
    id,
    cost: bot.baseCost,
    cps: bot.cps,
    roi: Math.round(bot.baseCost / bot.cps),
    costMult: bot.costMult
})));

// =============================================================================
// UPGRADES (still hardcoded - fewer of them, more unique effects)
// =============================================================================

export const UPGRADES = {
    typingMastery: {
        id: 'typingMastery',
        name: 'Typing Mastery',
        icon: '⌨️',
        description: '+5% coins per typed post',
        baseCost: 500,
        costMult: 2.0,
        maxLevel: 1000,
        unlockAt: 0,
        effect: (level) => 1 + level * 0.05
    },
    betterBots: {
        id: 'betterBots',
        name: 'Better Bots',
        icon: '🔧',
        description: '+5% all bot output',
        baseCost: 2000,
        costMult: 2.0,
        maxLevel: 1000,
        unlockAt: 1000,
        effect: (level) => 1 + level * 0.05
    }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBot(botId) {
    return BOTS[botId] || null;
}

export function getUpgrade(upgradeId) {
    return UPGRADES[upgradeId] || null;
}

export function getUnlockedBots(lifetimeCoins) {
    return Object.values(BOTS).filter(bot => lifetimeCoins >= bot.unlockAt);
}

export function getUnlockedUpgrades(lifetimeCoins) {
    return Object.values(UPGRADES).filter(upgrade => lifetimeCoins >= upgrade.unlockAt);
}

export function getUpgradeCost(upgradeId, currentLevel) {
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return Infinity;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel));
}

export function getBotCost(botId, currentCount) {
    const bot = BOTS[botId];
    if (!bot) return Infinity;
    return Math.floor(bot.baseCost * Math.pow(bot.costMult, currentCount));
}

// Export config for external tuning if needed
export { BOT_CONFIG, BOT_FLAVOR };
