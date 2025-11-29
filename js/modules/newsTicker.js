/**
 * News Ticker Module
 * Shows dynamic news and reactions about the player
 */

import * as State from '../state.js';
import { escapeHtml } from '../utils.js';

// Fake usernames for reactions
const FAKE_USERNAMES = [
    'CryptoKing2024', 'MoonShotMike', 'DiamondHands69', 'ElonFanboy',
    'TweetMaster3000', 'ViralVicky', 'BotDetector', 'ReplyGuySteve',
    'MainCharacterEnergy', 'RatioQueen', 'TouchGrass', 'NotABot',
    'ActuallyFamous', 'SmallAccountHere', 'VerifiedSoon', 'BlueCheckBad',
    'MediaLiterate', 'FirstReply', 'RandomThoughts', 'HotTakeHarry',
    'ThreadReader', 'DoomScrolling', 'CloutChaser', 'AlgorithmGamer',
    'TimelineWatcher', 'QuoteTweetKing', 'LikeAndRT', 'FollowBack',
    'MutualsMatter', 'BlockedByElon', 'SuspendedAgain', 'InfluencerLife'
];

// News templates - {username} is the player, {fake} is random fake user
const NEWS_TEMPLATES = {
    // General activity news
    general: [
        "Breaking: @{username} is back on the timeline!",
        "@{fake}: Has anyone seen @{username}'s posts lately? Wild.",
        "TRENDING: @{username} is gaining traction",
        "@{fake}: @{username} is cooking something special",
        "Sources say @{username} is about to go viral",
        "@{fake}: Ngl @{username}'s content has been fire lately",
        "People are talking about @{username}...",
        "@{fake}: @{username} is built different fr fr"
    ],
    // Follower milestones
    followers: [
        "@{fake}: Congrats @{username} on the new followers!",
        "JUST IN: @{username} is gaining followers fast",
        "@{fake}: @{username}'s follower count looking healthy",
        "Analysts predict @{username} to hit 1M soon",
        "@{fake}: The @{username} train is leaving the station"
    ],
    // Coin/earnings related
    coins: [
        "@{fake}: @{username} is making bank today",
        "BREAKING: @{username}'s coin reserves are growing",
        "@{fake}: Money printer goes brrrr for @{username}",
        "Financial experts impressed by @{username}'s gains",
        "@{fake}: @{username} secured the bag"
    ],
    // Viral post reactions
    viral: [
        "@{fake}: @{username} just went VIRAL",
        "EVERYONE is talking about @{username}'s latest post",
        "@{fake}: Main character vibes from @{username}",
        "The algorithm loves @{username} today",
        "@{fake}: @{username}'s post is everywhere rn"
    ],
    // Bot purchase reactions
    bots: [
        "@{fake}: @{username} is building a bot army",
        "ALERT: @{username} deployed more bots",
        "@{fake}: @{username}'s bots are working overtime",
        "Industry insiders say @{username}'s automation is impressive",
        "@{fake}: The bots are taking over @{username}'s timeline"
    ],
    // Typing speed reactions
    speed: [
        "@{fake}: @{username} types faster than I can think",
        "WATCH: @{username}'s fingers are on fire",
        "@{fake}: Speed demon @{username} at it again",
        "Keyboard manufacturers love @{username}",
        "@{fake}: How does @{username} type so fast??"
    ],
    // Combo reactions
    combo: [
        "@{fake}: @{username}'s combo is insane rn",
        "STREAK: @{username} is on a roll!",
        "@{fake}: The @{username} combo keeps going",
        "Can anyone stop @{username}'s streak?",
        "@{fake}: @{username} is unstoppable!"
    ],
    // Negative/hater reactions (adds spice)
    haters: [
        "@{fake}: @{username} is mid tbh",
        "@{fake}: Ratio + @{username} fell off",
        "@{fake}: @{username} probably bought followers lol",
        "@{fake}: Not reading all that @{username}",
        "@{fake}: Who asked @{username}?"
    ],
    // Supportive reactions
    supporters: [
        "@{fake}: @{username} is the goat no cap",
        "@{fake}: Proud to follow @{username}",
        "@{fake}: @{username} never misses",
        "@{fake}: W @{username} as always",
        "@{fake}: Let's goooo @{username}!"
    ]
};

// State
let tickerInterval = null;
let eventTextEl = null;
let currentNewsIndex = 0;
let newsQueue = [];
const MAX_NEWS_QUEUE = 20; // Prevent unbounded growth

/**
 * Initialize the news ticker
 */
export function initNewsTicker() {
    eventTextEl = document.getElementById('event-text');
    if (!eventTextEl) {
        console.warn('Event text element not found');
        return;
    }

    // Start ticker updates every 8 seconds
    tickerInterval = setInterval(updateTicker, 8000);

    // Subscribe to state changes for reactive news
    State.subscribe(handleStateChange);

    console.log('News ticker initialized');
}

/**
 * Handle state changes to trigger relevant news
 */
let lastFollowers = 0;
let lastCoins = 0;
let lastCombo = 0;
let lastBots = 0;

function handleStateChange() {
    const state = State.getState();

    // Check for follower milestones
    if (state.followers > lastFollowers + 50) {
        queueNews('followers');
        lastFollowers = state.followers;
    }

    // Check for coin milestones
    if (state.coins > lastCoins * 1.5 && state.coins > 100) {
        queueNews('coins');
        lastCoins = state.coins;
    }

    // Check for combo milestones
    if (state.combo >= 25 && state.combo > lastCombo + 25) {
        queueNews('combo');
        lastCombo = state.combo;
    }

    // Check for bot purchases
    const totalBots = Object.values(state.bots || {}).reduce((a, b) => a + b, 0);
    if (totalBots > lastBots) {
        queueNews('bots');
        lastBots = totalBots;
    }
}

/**
 * Queue a news item of a specific type
 */
function queueNews(type) {
    // Prevent unbounded queue growth
    if (newsQueue.length >= MAX_NEWS_QUEUE) return;
    const templates = NEWS_TEMPLATES[type] || NEWS_TEMPLATES.general;
    const template = templates[Math.floor(Math.random() * templates.length)];
    newsQueue.push(template);
}

/**
 * Update the ticker with new content
 */
function updateTicker() {
    const state = State.getState();
    if (!state.username) return;

    let newsItem;

    // Use queued news if available
    if (newsQueue.length > 0) {
        newsItem = newsQueue.shift();
    } else {
        // Pick a random category with weighted selection
        const categories = [
            { type: 'general', weight: 30 },
            { type: 'supporters', weight: 25 },
            { type: 'haters', weight: 15 },
            { type: 'speed', weight: 10 },
            { type: 'followers', weight: 10 },
            { type: 'coins', weight: 10 }
        ];

        const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedType = 'general';

        for (const category of categories) {
            random -= category.weight;
            if (random <= 0) {
                selectedType = category.type;
                break;
            }
        }

        const templates = NEWS_TEMPLATES[selectedType];
        newsItem = templates[Math.floor(Math.random() * templates.length)];
    }

    // Replace placeholders
    const fakeUser = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    const formattedNews = newsItem
        .replace(/{username}/g, state.username)
        .replace(/{fake}/g, fakeUser);

    // Update ticker with animation
    if (eventTextEl) {
        eventTextEl.style.opacity = '0';
        setTimeout(() => {
            eventTextEl.textContent = formattedNews;
            eventTextEl.style.opacity = '1';
        }, 200);
    }
}

/**
 * Show username prompt modal
 */
export function showUsernamePrompt() {
    return new Promise((resolve) => {
        // Check if username already set
        const state = State.getState();
        if (state.username) {
            resolve(state.username);
            return;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'username-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="username-modal-content">
                <div class="username-modal-header">
                    <span class="username-modal-logo">💩</span>
                    <h2>Welcome to Shitpost Hero!</h2>
                </div>
                <div class="username-modal-body">
                    <p>What should we call you on X?</p>
                    <div class="username-input-wrapper">
                        <span class="username-at">@</span>
                        <input type="text" id="username-input"
                            placeholder="your_handle"
                            maxlength="15"
                            autocomplete="off"
                            autofocus>
                    </div>
                    <p class="username-hint">This will be used in the news ticker</p>
                </div>
                <div class="username-modal-footer">
                    <button id="username-submit" class="btn btn-primary">Start Shitposting!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus input
        const input = document.getElementById('username-input');
        const submitBtn = document.getElementById('username-submit');

        setTimeout(() => {
            input?.focus();
        }, 100);

        // Handle submit
        const handleSubmit = () => {
            let username = input?.value.trim() || 'ShitposterSupreme';
            // Remove @ if they typed it
            username = username.replace(/^@/, '');
            // Validate (alphanumeric and underscore only)
            username = username.replace(/[^a-zA-Z0-9_]/g, '');
            if (!username) username = 'ShitposterSupreme';

            // Save to state
            State.updateState({ username }, true);

            // Remove modal with animation
            modal.classList.add('fade-out');
            setTimeout(() => {
                modal.remove();
                resolve(username);
            }, 300);
        };

        submitBtn?.addEventListener('click', handleSubmit);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    });
}

/**
 * Show a special news item (for events/achievements)
 */
export function showSpecialNews(message) {
    if (eventTextEl) {
        eventTextEl.textContent = message;
        eventTextEl.classList.add('highlight');
        setTimeout(() => eventTextEl.classList.remove('highlight'), 3000);
    }
}

/**
 * Cleanup
 */
export function cleanupNewsTicker() {
    if (tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
    }
}
