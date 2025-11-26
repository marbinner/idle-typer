/**
 * Typing Mechanic Module
 * Handles keyboard input, post display, and typing validation
 */

import * as State from '../state.js';
import { POSTS } from '../data/posts.js';
import { playSound, playAnticipationKeystroke, playCompletionClimax, playKachingSound } from './sound.js';
import { spawnParticles, spawnFloatingNumber } from './particles.js';
import { formatNumber } from '../utils.js';

// DOM Elements
let postTextEl;
let progressCircleEl;
let charCountEl;
let comboCountEl;
let totalPostsCountEl;
let postBtnEl;
let notificationContainerEl;
let historyListEl;
let postProgressFillEl;
let postProgressCountEl;
let balloonEl;

// Current typing state
let currentPost = null;
let typedIndex = 0;
let hasError = false;
let postStartTime = 0;
let lastCharTime = 0;
let wpmUpdateInterval = null;
let errorCount = 0; // Track errors per post
let goldenCharIndex = -1; // Index of golden character (-1 = none)

// Heat meter state
let heatValue = 0;
let heatDecayInterval = null;
let keystrokeTimes = []; // Track recent keystroke timestamps
let engagementGrowthInterval = null; // For periodic engagement growth

// Constants
const MAX_HISTORY_POSTS = 6;

// Rank system
const RANKS = [
    { name: 'Lurker', icon: '🥚', minXP: 0 },
    { name: 'Newbie', icon: '🐣', minXP: 100 },
    { name: 'Casual', icon: '🐤', minXP: 300 },
    { name: 'Regular', icon: '🐦', minXP: 600 },
    { name: 'Active', icon: '🦅', minXP: 1000 },
    { name: 'Dedicated', icon: '⭐', minXP: 2000 },
    { name: 'Expert', icon: '🌟', minXP: 4000 },
    { name: 'Master', icon: '💫', minXP: 7000 },
    { name: 'Legend', icon: '👑', minXP: 12000 },
    { name: 'Influencer', icon: '🏆', minXP: 20000 },
    { name: 'Celebrity', icon: '🎭', minXP: 35000 },
    { name: 'Icon', icon: '🌐', minXP: 60000 },
    { name: 'Main Character', icon: '🔥', minXP: 100000 }
];

// Progress ring constants
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 15.5; // r=15.5 from SVG

// History storage (last 20 posts)
let postHistory = [];

/**
 * Get post history for saving
 */
export function getPostHistory() {
    return postHistory;
}

/**
 * Clear post history (for reset)
 */
export function clearPostHistory() {
    postHistory = [];
    renderHistory();
    // Also reset balloon state
    resetBalloonState();
}

/**
 * Reset balloon state to defaults
 */
function resetBalloonState() {
    balloonPopping = false;
    balloonCycleStart = 0;
    balloonPopThreshold = Math.floor(Math.random() * 5) + 8; // 8-12
    // Reset balloon visual
    const balloonVisual = document.getElementById('balloon-visual');
    if (balloonVisual) {
        balloonVisual.style.fontSize = '35px';
        balloonVisual.style.filter = '';
        balloonVisual.style.opacity = '1';
    }
    const balloonContainer = document.getElementById('balloon-container');
    if (balloonContainer) {
        balloonContainer.classList.remove('ready', 'inflating', 'about-to-pop', 'critical', 'stage-1', 'stage-2', 'stage-3');
    }
}

/**
 * Load post history from save
 */
export function loadPostHistory(history) {
    console.log('loadPostHistory called with:', history?.length || 0, 'posts');
    if (Array.isArray(history)) {
        // Trim to max allowed posts (keep most recent)
        postHistory = history.slice(0, MAX_HISTORY_POSTS);
        console.log('Post history set to', postHistory.length, 'posts, rendering...');
        renderHistory();
    } else {
        console.log('History is not an array, skipping');
        postHistory = [];
        renderHistory();
    }
}

/**
 * Get balloon state for saving
 */
export function getBalloonState() {
    return {
        cycleStart: balloonCycleStart,
        popThreshold: balloonPopThreshold
    };
}

/**
 * Get current typing state for saving
 */
export function getTypingState() {
    if (!currentPost) return null;
    return {
        postText: currentPost.text,
        postCategory: currentPost.category,
        typedIndex: typedIndex,
        goldenCharIndex: goldenCharIndex,
        errorCount: errorCount
    };
}

/**
 * Load typing state from save (restore current post)
 */
export function loadTypingState(state) {
    if (state && state.postText) {
        currentPost = {
            text: state.postText,
            category: state.postCategory || null
        };
        typedIndex = state.typedIndex || 0;
        goldenCharIndex = state.goldenCharIndex !== undefined ? state.goldenCharIndex : -1;
        errorCount = state.errorCount || 0;

        // Reset timing - will start fresh when typing resumes
        postStartTime = 0;
        lastCharTime = 0;

        // Start WPM update interval
        if (wpmUpdateInterval) clearInterval(wpmUpdateInterval);
        wpmUpdateInterval = setInterval(updateLiveWPM, 200);

        // Render the restored post
        renderPost();
        updateProgress();
        updateWPMDisplay();
        return true;
    }
    return false;
}

/**
 * Load balloon state from save
 * If no state saved, initialize balloon to start fresh (empty)
 */
export function loadBalloonState(state) {
    const gameState = State.getState();
    const currentPosts = gameState.lifetimePosts || 0;

    if (state && typeof state.cycleStart === 'number') {
        balloonCycleStart = state.cycleStart;
    } else {
        // No saved balloon state - start fresh from current posts
        balloonCycleStart = currentPosts;
    }

    // IMPORTANT: Ensure balloonCycleStart is never greater than lifetimePosts
    // This can happen if loading a save from a different session
    if (balloonCycleStart > currentPosts) {
        console.log(`Balloon cycle reset: cycleStart (${balloonCycleStart}) > lifetimePosts (${currentPosts})`);
        balloonCycleStart = currentPosts;
    }

    if (state && typeof state.popThreshold === 'number') {
        balloonPopThreshold = state.popThreshold;
    }

    console.log(`Balloon loaded: cycleStart=${balloonCycleStart}, threshold=${balloonPopThreshold}, currentPosts=${currentPosts}`);

    // Update balloon display after loading state
    updatePostProgress();
}

/**
 * Initialize the typing system
 */
export function initTyping() {
    // Cache DOM elements
    postTextEl = document.getElementById('post-text');
    progressCircleEl = document.getElementById('progress-circle');
    charCountEl = document.getElementById('char-count');
    comboCountEl = document.getElementById('combo-count');
    totalPostsCountEl = document.getElementById('total-posts-count');
    postBtnEl = document.getElementById('post-btn');
    notificationContainerEl = document.getElementById('notification-container');
    historyListEl = document.getElementById('history-list');
    postProgressFillEl = document.getElementById('post-progress-fill');
    postProgressCountEl = document.getElementById('post-progress-count');
    balloonEl = document.querySelector('.progress-dot.balloon');

    // Set up balloon click handler
    const balloonContainer = document.getElementById('balloon-container');
    if (balloonContainer) {
        balloonContainer.addEventListener('click', handleBalloonClick);
    }

    // Note: updatePostProgress() is called after balloon state is loaded in app.js

    // Initialize rank display
    updateRankDisplay();

    // Clear any existing intervals to prevent memory leaks on re-init
    if (heatDecayInterval) clearInterval(heatDecayInterval);
    if (engagementGrowthInterval) clearInterval(engagementGrowthInterval);

    // Start heat decay interval
    heatDecayInterval = setInterval(() => {
        if (heatValue > 0) {
            heatValue = Math.max(0, heatValue - 2);
            updateHeatMeter();
        }
    }, 100);

    // Start engagement growth interval (grows likes/retweets on posts over time)
    engagementGrowthInterval = setInterval(() => {
        postHistory.forEach((_, index) => startEngagementGrowth(index));
    }, 2000);

    // Initialize progress ring
    if (progressCircleEl) {
        progressCircleEl.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
        progressCircleEl.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
    }

    // Set up keyboard listener (remove first to prevent duplicates on re-init)
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    // Note: loadNewPost() is called by app.js after checking for saved typing state
}

/**
 * Load a new post to type
 */
export function loadNewPost() {
    // Get random post based on difficulty/progression
    currentPost = getRandomPost();

    typedIndex = 0;
    hasError = false;
    errorCount = 0;
    postStartTime = 0; // Will be set on first keystroke
    lastCharTime = 0;

    // Generate golden character (20% chance, random position)
    // OR all characters are golden during Golden Hour event
    const initState = State.getState();
    goldenCharIndex = -1;

    if (initState.eventAllGolden) {
        // All characters are golden during Golden Hour!
        goldenCharIndex = -2; // Special value meaning "all golden"
    } else if (Math.random() < 0.20 && currentPost.text.length > 10) {
        // Pick a random character that isn't a space (in the middle 60% of the post)
        const start = Math.floor(currentPost.text.length * 0.2);
        const end = Math.floor(currentPost.text.length * 0.8);
        const attempts = 10;
        for (let i = 0; i < attempts; i++) {
            const idx = start + Math.floor(Math.random() * (end - start));
            if (currentPost.text[idx] !== ' ') {
                goldenCharIndex = idx;
                break;
            }
        }
    }

    // Reset current WPM display
    State.updateState({ currentPost, typedIndex: 0, currentWPM: 0 });

    // Start WPM update interval
    if (wpmUpdateInterval) clearInterval(wpmUpdateInterval);
    wpmUpdateInterval = setInterval(updateLiveWPM, 200);

    // Render the post
    renderPost();
    updateProgress();
    updateWPMDisplay();
}

/**
 * Get a random post from the library
 */
function getRandomPost() {
    const state = State.getState();
    const postsTyped = state.lifetimePosts;

    // Filter posts by difficulty based on progression
    let availablePosts = POSTS;

    if (postsTyped < 5) {
        // First few posts: medium length to learn
        availablePosts = POSTS.filter(p => p.text.length >= 30 && p.text.length <= 80);
    } else if (postsTyped < 20) {
        // Early game: medium to long posts
        availablePosts = POSTS.filter(p => p.text.length >= 40 && p.text.length <= 120);
    }
    // Later: all posts available (including longest ones)

    // If no posts match criteria, use all
    if (availablePosts.length === 0) {
        availablePosts = POSTS;
    }

    // Random selection
    const index = Math.floor(Math.random() * availablePosts.length);
    return availablePosts[index];
}

/**
 * Render the current post with character spans grouped by words
 */
function renderPost() {
    if (!postTextEl || !currentPost) return;

    const text = currentPost.text;
    let html = '';
    let charIndex = 0;

    // Split into words (keeping spaces as separate "words")
    const tokens = text.split(/(\s+)/);

    tokens.forEach(token => {
        if (token.length === 0) return;

        // Check if this is whitespace
        const isWhitespace = /^\s+$/.test(token);

        if (isWhitespace) {
            // Render spaces directly (allow line breaks after spaces)
            for (let i = 0; i < token.length; i++) {
                let className = 'char';
                if (charIndex < typedIndex) {
                    className += ' typed';
                } else if (charIndex === typedIndex) {
                    className += ' current';
                }
                // Golden: either specific index or all (-2 means all golden)
                if (charIndex === goldenCharIndex || (goldenCharIndex === -2 && token[i] !== ' ')) {
                    className += ' golden';
                }
                html += `<span class="${className}" data-index="${charIndex}">&nbsp;</span>`;
                charIndex++;
            }
        } else {
            // Wrap word in a container to prevent breaking
            html += '<span class="word">';
            for (let i = 0; i < token.length; i++) {
                let className = 'char';
                if (charIndex < typedIndex) {
                    className += ' typed';
                } else if (charIndex === typedIndex) {
                    className += ' current';
                }
                // Golden: either specific index or all (-2 means all golden)
                if (charIndex === goldenCharIndex || goldenCharIndex === -2) {
                    className += ' golden';
                }
                const displayChar = escapeHtml(token[i]);
                html += `<span class="${className}" data-index="${charIndex}">${displayChar}</span>`;
                charIndex++;
            }
            html += '</span>';
        }
    });

    postTextEl.innerHTML = html;
}

/**
 * Handle keydown events
 */
function handleKeyDown(event) {
    // Ignore if modifier keys are pressed (except shift)
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Ignore certain keys
    const ignoredKeys = ['Tab', 'Escape', 'CapsLock', 'Shift', 'Control', 'Alt', 'Meta'];
    if (ignoredKeys.includes(event.key)) return;

    // Prevent default for space to avoid page scroll
    if (event.key === ' ') {
        event.preventDefault();
    }

    // Get expected character
    if (!currentPost || typedIndex >= currentPost.text.length) return;

    const expectedChar = currentPost.text[typedIndex];
    const typedChar = event.key;

    // Check if correct
    if (typedChar === expectedChar) {
        handleCorrectChar();
    } else {
        handleIncorrectChar();
    }
}

/**
 * Handle correct character typed
 */
function handleCorrectChar() {
    // Start timer on first character (or when resuming a saved post)
    if (postStartTime === 0) {
        postStartTime = Date.now();
    }
    lastCharTime = Date.now();

    // Update heat meter
    keystrokeTimes.push(Date.now());
    keystrokeTimes = keystrokeTimes.filter(t => Date.now() - t < 1000); // Keep last 1 second
    heatValue = Math.min(100, heatValue + 5 + keystrokeTimes.length);
    updateHeatMeter();

    const charEl = postTextEl.querySelector(`[data-index="${typedIndex}"]`);
    const isGoldenChar = typedIndex === goldenCharIndex || goldenCharIndex === -2;

    // Update character state
    if (charEl) {
        charEl.classList.remove('current', 'error');
        charEl.classList.add('typed');
        charEl.classList.add('animate-char-typed');
        if (isGoldenChar) {
            charEl.classList.add('golden-collected');
        }
    }

    // Increment combo
    State.incrementCombo();
    hasError = false;

    // Play sound with pitch based on combo
    const state = State.getState();
    const pitchBonus = Math.min(state.combo * 0.01, 0.5);

    // Golden character bonus!
    if (isGoldenChar) {
        // Smaller bonus during "all golden" event (5 coins vs 50)
        const isAllGolden = goldenCharIndex === -2;
        const bonusCoins = Math.floor((isAllGolden ? 5 : 50) * state.globalMultiplier);
        State.addCoins(bonusCoins, 'golden');

        // Track golden chars hit for achievements
        State.updateState({ goldenCharsHit: (state.goldenCharsHit || 0) + 1 });

        if (isAllGolden) {
            // Quieter effect for all-golden mode
            playSound('keystroke', { pitch: 1.3, pitchVariation: 0.1 });
            if (charEl) {
                const rect = charEl.getBoundingClientRect();
                spawnParticles('keystroke', rect.left + rect.width / 2, rect.top, 5);
            }
        } else {
            // Big effect for single golden character
            playSound('premium', { pitch: 1.2 });
            if (charEl) {
                const rect = charEl.getBoundingClientRect();
                spawnParticles('viral', rect.left + rect.width / 2, rect.top, 20);
                spawnFloatingNumber(`GOLDEN +${bonusCoins}`, rect.left, rect.top - 30, 'xcoins');
            }
            showNotification('Golden Character! +' + bonusCoins + ' coins', 'coins');
        }
    } else {
        // Play anticipation sound that builds with progress
        const progress = typedIndex / currentPost.text.length;
        playAnticipationKeystroke(progress);
    }

    // Small particle burst at character position (non-golden)
    if (charEl && !isGoldenChar) {
        const rect = charEl.getBoundingClientRect();
        spawnParticles('keystroke', rect.left + rect.width / 2, rect.top, 3);
    }

    // Move to next character
    typedIndex++;
    State.updateState({
        typedIndex,
        totalCharsTyped: (state.totalCharsTyped || 0) + 1
    });

    // Combo milestone celebrations!
    const newCombo = state.combo + 1;
    if (newCombo === 25 || newCombo === 50 || newCombo === 100 || newCombo === 200 || newCombo === 500) {
        celebrateComboMilestone(newCombo);
    }

    // Update next character highlight
    const nextCharEl = postTextEl.querySelector(`[data-index="${typedIndex}"]`);
    if (nextCharEl) {
        nextCharEl.classList.add('current');
    }

    // Update progress
    updateProgress();

    // Check if post is complete
    if (typedIndex >= currentPost.text.length) {
        completePost();
    }

    // Update combo display
    updateComboDisplay();
}

/**
 * Celebrate reaching a combo milestone
 */
function celebrateComboMilestone(combo) {
    const bonusCoins = combo * 2;
    const state = State.getState();
    State.addCoins(Math.floor(bonusCoins * state.globalMultiplier), 'combo');

    playSound('achievement');

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles('confetti', centerX, centerY, combo >= 100 ? 40 : 20);
    spawnFloatingNumber(combo + ' COMBO!', centerX, centerY - 100, 'viral');

    showNotification(combo + ' Combo! +' + bonusCoins + ' coins', 'perfect');
}

/**
 * Handle incorrect character typed
 */
function handleIncorrectChar() {
    const charEl = postTextEl.querySelector(`[data-index="${typedIndex}"]`);

    // Show error state
    if (charEl) {
        charEl.classList.add('error');
        charEl.classList.add('animate-char-error');

        // Remove animation class after it completes
        setTimeout(() => {
            charEl.classList.remove('animate-char-error');
        }, 300);
    }

    // Track error and reset combo
    errorCount++;
    State.resetCombo();
    hasError = true;

    // Play error sound
    playSound('error');

    // Screen shake for error
    document.body.classList.add('animate-shake');
    setTimeout(() => {
        document.body.classList.remove('animate-shake');
    }, 400);

    // Update combo display
    updateComboDisplay();
}

/**
 * Complete the current post
 */
function completePost() {
    // Guard against null currentPost
    if (!currentPost) return;

    // Stop WPM updates
    if (wpmUpdateInterval) clearInterval(wpmUpdateInterval);

    const state = State.getState();
    const postLength = currentPost.text.length;
    const typingTime = Date.now() - postStartTime;
    // Use local errorCount for THIS post, not global state.errors
    const isPerfect = errorCount === 0;

    // Calculate final WPM (guard against division by zero)
    const words = postLength / 5; // Standard: 5 chars = 1 word
    const minutes = typingTime / 60000;
    const finalWPM = minutes > 0 ? Math.round(words / minutes) : 0;

    // Track WPM records
    const wpmResult = trackWPMRecord(finalWPM, state);

    // ===== NEW BALANCED REWARD SYSTEM =====
    // Typing rewards now SCALE with progression to always be worthwhile

    // Base typing reward (scales with coinsPerPost which includes multipliers)
    let baseTypingReward = state.coinsPerPost * (postLength / 50);

    // CPS BONUS: Typing gives you bonus equal to X seconds of idle income
    // This ensures typing is ALWAYS worth doing, even late game
    // Base: 5 seconds of CPS, scales up with WPM
    let cpsSecondsBonus = 5;
    if (finalWPM >= 100) {
        cpsSecondsBonus = 15; // 15 seconds of CPS for pro typing
    } else if (finalWPM >= 80) {
        cpsSecondsBonus = 12;
    } else if (finalWPM >= 60) {
        cpsSecondsBonus = 9;
    } else if (finalWPM >= 40) {
        cpsSecondsBonus = 7;
    }

    // Calculate CPS bonus (minimum of 10 coins to be meaningful early game)
    const cpsBonus = Math.max(10, Math.floor(state.coinsPerSecond * cpsSecondsBonus));

    // Total coin reward = base + CPS bonus
    let coinReward = baseTypingReward + cpsBonus;
    let followerReward = Math.floor(postLength / 20) + 1; // +1 ensures at least 1
    let impressionReward = state.impressionsPerPost;

    // Perfect bonus (no errors in post)
    const perfectBonus = isPerfect ? 1.5 : 1;
    coinReward *= perfectBonus;
    if (isPerfect) {
        followerReward *= 2;
        impressionReward *= 1.5;
    }

    // WPM bonus - reward fast typing!
    let wpmBonus = 1;
    let wpmBonusName = '';
    if (finalWPM >= 120) {
        wpmBonus = 3.0;
        wpmBonusName = 'BLAZING SPEED';
    } else if (finalWPM >= 100) {
        wpmBonus = 2.5;
        wpmBonusName = 'SPEED DEMON';
    } else if (finalWPM >= 80) {
        wpmBonus = 2.0;
        wpmBonusName = 'FAST FINGERS';
    } else if (finalWPM >= 60) {
        wpmBonus = 1.5;
        wpmBonusName = 'QUICK';
    }
    coinReward *= wpmBonus;

    // Extra bonus for beating personal best!
    if (wpmResult.isPersonalBest) {
        coinReward *= 2;
        followerReward *= 5;
        impressionReward *= 3;
    } else if (wpmResult.isAboveAvg) {
        coinReward *= 1.25;
        followerReward *= 2;
    }

    // Combo bonus (capped at 3x for higher ceiling)
    const comboBonus = Math.min(1 + state.combo * 0.01, 3);
    coinReward *= comboBonus;

    // Streak bonus (more impactful)
    const streakBonus = 1 + Math.floor(state.streak / 3) * 0.15;
    coinReward *= streakBonus;

    // Category bonus
    if (currentPost.category) {
        coinReward *= currentPost.coinMult || 1;
        impressionReward *= currentPost.impressionMult || 1;
    }

    // Final rounding
    coinReward = Math.floor(coinReward);
    followerReward = Math.max(1, Math.floor(followerReward));
    impressionReward = Math.floor(impressionReward);

    // Calculate how many seconds of idle income this represents
    const idleEquivalentSeconds = state.coinsPerSecond > 0
        ? Math.round(coinReward / state.coinsPerSecond)
        : 0;

    // Check for viral
    const viralResult = checkViral();
    if (viralResult) {
        coinReward *= viralResult.multiplier;
        followerReward *= Math.floor(viralResult.multiplier / 2) || 1;
        impressionReward *= viralResult.impressionMult || viralResult.multiplier;
    }

    // Award coins, followers and impressions
    State.addCoins(coinReward, 'typing');
    State.addFollowers(followerReward, 'typing');
    State.addImpressions(impressionReward);
    State.completePost(isPerfect, viralResult ? viralResult.name : null);

    // Track pro typer posts (95%+ accuracy AND 80+ WPM)
    const postAccuracy = postLength > 0 ? ((postLength - errorCount) / postLength) * 100 : 100;
    if (postAccuracy >= 95 && finalWPM >= 80) {
        State.updateState({ proTyperPosts: (state.proTyperPosts || 0) + 1 });
    }

    // Play completion climax sound!
    playCompletionClimax();
    if (wpmResult.isPersonalBest) {
        playSound('premium'); // Additional celebration sound
    } else if (isPerfect) {
        playSound('perfect');
    }

    // Visual feedback on compose box
    const composeBox = document.getElementById('compose-box');
    if (composeBox) {
        composeBox.classList.add('animate-celebrate');
        if (wpmResult.isPersonalBest) {
            composeBox.classList.add('animate-main-character');
        }
        setTimeout(() => {
            composeBox.classList.remove('animate-celebrate', 'animate-main-character');
        }, 1000);
    }

    // Spawn particles
    const rect = postTextEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate accuracy
    const accuracy = Math.round(((postLength - errorCount) / postLength) * 100);
    const isViralPost = !!viralResult;

    // Show floating numbers for rewards
    spawnFloatingNumber(`+${formatNumber(coinReward)} μ₿`, centerX, centerY - 30, 'xcoins');
    if (followerReward > 1) {
        spawnFloatingNumber(`+${followerReward} Followers`, centerX, centerY - 70, 'followers');
    }
    if (wpmBonusName) {
        spawnFloatingNumber(wpmBonusName, centerX, centerY - 110, 'viral');
    }
    if (wpmResult.isPersonalBest) {
        spawnFloatingNumber('NEW RECORD!', centerX, centerY - 150, 'viral');
    }
    if (viralResult) {
        spawnFloatingNumber(viralResult.name, centerX, centerY - 150, 'viral');
    }

    // Show particles
    if (wpmResult.isPersonalBest) {
        spawnParticles('viral', centerX, centerY, 100);
    } else if (viralResult) {
        spawnParticles('confetti', centerX, centerY, viralResult.particles);
    } else if (wpmBonusName) {
        spawnParticles('confetti', centerX, centerY, 35);
    } else if (isPerfect) {
        spawnParticles('confetti', centerX, centerY, 25);
    } else {
        spawnParticles('confetti', centerX, centerY, 15);
    }

    // Add to history
    addToHistory(currentPost.text, finalWPM, accuracy, coinReward, isPerfect, isViralPost);

    // Update post progress and rank display
    updatePostProgress();
    updateRankDisplay();

    // Load next post after brief delay
    setTimeout(() => {
        loadNewPost();
    }, wpmResult.isPersonalBest ? 1500 : 500);
}

/**
 * Track WPM record and update state
 */
function trackWPMRecord(wpm, state) {
    const isPersonalBest = wpm > state.bestWPM && wpm > 0;
    const avgWPM = state.avgWPM || 0;
    const isAboveAvg = wpm > avgWPM && avgWPM > 0;

    // Update recent WPMs (keep last 10)
    const recentWPMs = [...state.recentWPMs, wpm].slice(-10);

    // Calculate new average
    const newAvgWPM = recentWPMs.length > 0
        ? Math.round(recentWPMs.reduce((a, b) => a + b, 0) / recentWPMs.length)
        : 0;

    // Update streak
    let wpmRecordStreak = state.wpmRecordStreak;
    if (isAboveAvg) {
        wpmRecordStreak++;
    } else {
        wpmRecordStreak = 0;
    }

    // Update state
    State.updateState({
        currentWPM: wpm,
        bestWPM: isPersonalBest ? wpm : state.bestWPM,
        recentWPMs,
        avgWPM: newAvgWPM,
        wpmRecordStreak
    });

    return { isPersonalBest, isAboveAvg, wpmRecordStreak };
}

/**
 * Update live WPM during typing
 */
function updateLiveWPM() {
    if (!postStartTime || typedIndex === 0) {
        updateWPMDisplay();
        return;
    }

    const elapsed = Date.now() - postStartTime;
    const words = typedIndex / 5;
    const minutes = elapsed / 60000;
    const currentWPM = minutes > 0 ? Math.round(words / minutes) : 0;

    State.updateState({ currentWPM }, true);
    updateWPMDisplay();
}

/**
 * Update WPM and accuracy display in UI
 */
function updateWPMDisplay() {
    const state = State.getState();
    const wpmValueEl = document.getElementById('wpm-value');
    const wpmBestEl = document.getElementById('wpm-best');
    const wpmAvgEl = document.getElementById('wpm-avg');
    const accuracyValueEl = document.getElementById('accuracy-value');
    const accuracyDisplayEl = document.getElementById('accuracy-display');

    if (wpmValueEl) {
        wpmValueEl.textContent = state.currentWPM || 0;

        // Color based on performance
        wpmValueEl.className = 'stat-number';
        if (state.currentWPM >= 100) {
            wpmValueEl.classList.add('wpm-excellent');
        } else if (state.currentWPM >= 80) {
            wpmValueEl.classList.add('wpm-great');
        } else if (state.currentWPM >= 60) {
            wpmValueEl.classList.add('wpm-good');
        }
    }

    if (wpmBestEl) {
        wpmBestEl.textContent = state.bestWPM || 0;
    }

    // Update average WPM display
    if (wpmAvgEl) {
        wpmAvgEl.textContent = state.avgWPM || 0;
    }

    // Update accuracy display
    if (accuracyValueEl && accuracyDisplayEl) {
        const accuracy = calculateCurrentAccuracy();
        accuracyValueEl.textContent = accuracy;

        // Update styling based on accuracy
        accuracyDisplayEl.classList.remove('perfect', 'has-errors');
        if (accuracy === 100 && typedIndex > 0) {
            accuracyDisplayEl.classList.add('perfect');
        } else if (accuracy < 100) {
            accuracyDisplayEl.classList.add('has-errors');
        }
    }
}

/**
 * Calculate current accuracy percentage
 */
function calculateCurrentAccuracy() {
    if (typedIndex === 0) return 100;
    const accuracy = Math.round(((typedIndex - errorCount) / typedIndex) * 100);
    return Math.max(0, accuracy);
}

/**
 * Check if post goes viral
 */
function checkViral() {
    const state = State.getState();
    const random = Math.random();

    // Pity system: increase chance based on posts without viral
    const postsSinceViral = state.lifetimePosts % 50; // Reset every 50
    const pityBonus = postsSinceViral * 0.005; // +0.5% per post

    // Check viral tiers (from highest to lowest)
    if (random < 0.001 + pityBonus * 0.1) {
        return { name: 'MAIN CHARACTER', multiplier: 100, impressionMult: 500, particles: 100 };
    }
    if (random < 0.005 + pityBonus * 0.5) {
        return { name: 'SUPER VIRAL', multiplier: 50, impressionMult: 200, particles: 60 };
    }
    if (random < 0.03 + pityBonus) {
        return { name: 'VIRAL', multiplier: 10, impressionMult: 50, particles: 30 };
    }
    if (random < 0.10 + pityBonus * 2) {
        return { name: 'Mini-viral', multiplier: 2, impressionMult: 5, particles: 15 };
    }

    return null;
}

/**
 * Update progress ring and character count
 */
function updateProgress() {
    if (!currentPost) return;

    const progress = typedIndex / currentPost.text.length;

    // Update SVG progress ring (counter-clockwise fill)
    if (progressCircleEl) {
        const offset = CIRCLE_CIRCUMFERENCE - (progress * CIRCLE_CIRCUMFERENCE);
        progressCircleEl.style.strokeDashoffset = offset;

        // Change color as we approach completion
        if (progress >= 1) {
            progressCircleEl.style.stroke = 'var(--success-green)';
        } else if (progress > 0.8) {
            progressCircleEl.style.stroke = 'var(--x-premium-gold)';
        } else {
            progressCircleEl.style.stroke = 'var(--x-blue)';
        }
    }

    // Update character count (X-style: current/max)
    if (charCountEl) {
        charCountEl.textContent = `${typedIndex}/${currentPost.text.length}`;
    }

    // Update total posts display
    updateTotalPostsDisplay();
}

/**
 * Update total posts display
 */
function updateTotalPostsDisplay() {
    if (!totalPostsCountEl) return;

    const state = State.getState();
    totalPostsCountEl.textContent = formatNumber(state.lifetimePosts || 0);
}

/**
 * Update combo display
 */
function updateComboDisplay() {
    const state = State.getState();

    if (comboCountEl) {
        comboCountEl.textContent = state.combo;

        // Add animation for combo increase
        if (state.combo > 0) {
            comboCountEl.classList.add('animate-combo-increment');
            setTimeout(() => {
                comboCountEl.classList.remove('animate-combo-increment');
            }, 300);
        }
    }

    // Check for "on fire" state
    const comboDisplay = document.getElementById('combo-display');
    if (comboDisplay) {
        if (state.combo >= 50) {
            comboDisplay.classList.add('animate-on-fire');
        } else {
            comboDisplay.classList.remove('animate-on-fire');
        }
    }

    // Update total posts display when combo changes
    updateTotalPostsDisplay();

    // Update streak display
    updateStreakDisplay();
}

/**
 * Update streak display
 */
function updateStreakDisplay() {
    const state = State.getState();
    const streakCountEl = document.getElementById('streak-count');
    const streakDisplay = document.getElementById('streak-display');

    if (streakCountEl) {
        streakCountEl.textContent = state.streak;
    }

    // Add "hot" styling when streak is 5+
    if (streakDisplay) {
        if (state.streak >= 5) {
            streakDisplay.classList.add('hot');
        } else {
            streakDisplay.classList.remove('hot');
        }
    }
}

/**
 * Show event message
 */
function showEvent(message) {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
        eventText.classList.add('highlight');
        setTimeout(() => {
            eventText.classList.remove('highlight');
        }, 3000);
    }
}


/**
 * Escape HTML entities
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show a notification above the typing area
 */
function showNotification(message, type = 'default') {
    if (!notificationContainerEl) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationContainerEl.appendChild(notification);

    // Remove after animation completes (4 seconds)
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

/**
 * Add entry to history panel
 */
function addToHistory(postText, wpm, accuracy, coins, isPerfect, isViral) {
    const state = State.getState();
    const followers = state.followers || 0;

    // Calculate initial engagement based on post quality and followers
    const baseEngagement = Math.floor(followers * 0.01) + 1;
    const qualityMult = isPerfect ? 2 : 1;
    const viralMult = isViral ? 5 : 1;

    // Create history entry with engagement
    const entry = {
        text: postText,
        wpm,
        accuracy,
        coins,
        isPerfect,
        isViral,
        timestamp: Date.now(),
        engagement: {
            views: Math.floor((baseEngagement * 10 + Math.random() * 50) * qualityMult * viralMult),
            likes: Math.floor((baseEngagement + Math.random() * 5) * qualityMult * viralMult),
            retweets: Math.floor((baseEngagement * 0.3 + Math.random() * 2) * qualityMult * viralMult),
            comments: Math.floor((baseEngagement * 0.1 + Math.random() * 2) * qualityMult * viralMult)
        }
    };

    // Add to front of history
    postHistory.unshift(entry);

    // Keep only last 8 posts in the panel
    if (postHistory.length > MAX_HISTORY_POSTS) {
        postHistory.pop();
    }

    // Render history
    renderHistory();

    // Start engagement growth for this post
    startEngagementGrowth(0);
}

/**
 * Gradually increase engagement on posts over time
 */
function startEngagementGrowth(index) {
    if (index >= postHistory.length) return;

    const entry = postHistory[index];
    if (!entry || !entry.engagement) return;

    // Growth rate decreases with age
    const ageFactor = Math.max(0.1, 1 - (index * 0.15));
    const viralFactor = entry.isViral ? 3 : 1;

    // Track changes for floating numbers
    const changes = { views: 0, likes: 0, retweets: 0, comments: 0 };

    // Random engagement increases
    if (Math.random() < 0.3 * ageFactor * viralFactor) {
        const increase = Math.floor(Math.random() * 10 * ageFactor * viralFactor) + 1;
        entry.engagement.views += increase;
        changes.views = increase;
    }
    if (Math.random() < 0.15 * ageFactor * viralFactor) {
        const increase = Math.floor(Math.random() * 3 * ageFactor * viralFactor) + 1;
        entry.engagement.likes += increase;
        changes.likes = increase;
    }
    if (Math.random() < 0.05 * ageFactor * viralFactor) {
        entry.engagement.retweets += 1;
        changes.retweets = 1;
    }
    if (Math.random() < 0.03 * ageFactor * viralFactor) {
        entry.engagement.comments += 1;
        changes.comments = 1;
    }

    // Update display with floating indicators
    updateEngagementDisplay(index, changes);
}

/**
 * Update engagement display for a specific post
 */
function updateEngagementDisplay(index, changes = null) {
    const engagementEl = document.querySelector(`[data-history-index="${index}"] .tweet-engagement`);
    if (!engagementEl || !postHistory[index]) return;

    const e = postHistory[index].engagement;

    // Update each stat and show floating +N if changed
    const stats = [
        { key: 'comments', selector: '.comments .count', color: '#1d9bf0' },
        { key: 'retweets', selector: '.retweets .count', color: '#00ba7c' },
        { key: 'likes', selector: '.likes .count', color: '#f91880' },
        { key: 'views', selector: '.views .count', color: '#1d9bf0' }
    ];

    stats.forEach(stat => {
        const countEl = engagementEl.querySelector(stat.selector);
        if (countEl) {
            countEl.textContent = formatEngagement(e[stat.key]);

            // Show floating +N indicator if there's a change
            if (changes && changes[stat.key] > 0) {
                showEngagementPopup(countEl, changes[stat.key], stat.color);
            }
        }
    });
}

/**
 * Show a floating +N popup next to an engagement stat
 */
function showEngagementPopup(element, amount, color) {
    const rect = element.getBoundingClientRect();

    const popup = document.createElement('div');
    popup.className = 'engagement-popup';
    popup.textContent = '+' + amount;
    popup.style.left = (rect.left + rect.width / 2) + 'px';
    popup.style.top = rect.top + 'px';
    popup.style.color = color;

    document.body.appendChild(popup);

    // Remove after animation
    setTimeout(() => popup.remove(), 800);
}

/**
 * Format engagement numbers
 */
function formatEngagement(num) {
    if (num < 1000) return num.toString();
    if (num < 10000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000) return Math.floor(num / 1000) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
}

// Note: engagementGrowthInterval is started in initTyping()

/**
 * Render history panel
 */
function renderHistory() {
    console.log('renderHistory called, historyListEl:', !!historyListEl, 'postHistory length:', postHistory.length);
    if (!historyListEl) {
        console.log('historyListEl not found, skipping render');
        return;
    }

    if (postHistory.length === 0) {
        console.log('Empty post history, showing empty state');
        historyListEl.innerHTML = '<div class="history-empty">Type your first post!</div>';
        return;
    }

    // SVG icons for Twitter-like engagement buttons
    const commentSvg = '<svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>';
    const retweetSvg = '<svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>';
    const likeSvg = '<svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>';
    const viewsSvg = '<svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>';

    historyListEl.innerHTML = postHistory.map((entry, index) => {
        const classes = ['history-item', 'tweet'];
        if (entry.isPerfect) classes.push('perfect');
        if (entry.isViral) classes.push('viral');

        // Truncate text
        const truncatedText = entry.text.length > 80
            ? entry.text.substring(0, 80) + '...'
            : entry.text;

        const e = entry.engagement || { views: 0, likes: 0, retweets: 0, comments: 0 };

        // Time ago
        const timeAgo = getTimeAgo(entry.timestamp);

        // Badges
        const has100Accuracy = entry.accuracy === 100;
        let badges = '';
        if (entry.isViral || entry.isPerfect || has100Accuracy) {
            badges = '<div class="tweet-badges">';
            if (entry.isViral) badges += '<span class="viral-badge">🔥 VIRAL</span>';
            if (has100Accuracy) badges += '<span class="accuracy-badge">💯</span>';
            if (entry.isPerfect && !has100Accuracy) badges += '<span class="perfect-badge">✓ PERFECT</span>';
            badges += '</div>';
        }

        return `
            <div class="${classes.join(' ')}" data-history-index="${index}">
                <div class="tweet-layout">
                    <div class="tweet-avatar">🤡</div>
                    <div class="tweet-body">
                        <div class="tweet-header">
                            <span class="tweet-name">You</span>
                            <span class="tweet-handle">@player</span>
                            <span class="tweet-separator">·</span>
                            <span class="tweet-time">${timeAgo}</span>
                        </div>
                        ${badges}
                        <div class="tweet-content">${escapeHtml(truncatedText)}</div>
                        <div class="tweet-engagement">
                            <div class="engagement-item comments">
                                <div class="icon-wrap">${commentSvg}</div>
                                <span class="count">${formatEngagement(e.comments)}</span>
                            </div>
                            <div class="engagement-item retweets">
                                <div class="icon-wrap">${retweetSvg}</div>
                                <span class="count">${formatEngagement(e.retweets)}</span>
                            </div>
                            <div class="engagement-item likes">
                                <div class="icon-wrap">${likeSvg}</div>
                                <span class="count">${formatEngagement(e.likes)}</span>
                            </div>
                            <div class="engagement-item views">
                                <div class="icon-wrap">${viewsSvg}</div>
                                <span class="count">${formatEngagement(e.views)}</span>
                            </div>
                        </div>
                        <div class="tweet-stats">
                            <span class="tweet-stat wpm"><span class="label">WPM</span> <span class="value">${entry.wpm}</span></span>
                            <span class="tweet-stat accuracy"><span class="label">ACC</span> <span class="value">${entry.accuracy}%</span></span>
                            <span class="tweet-stat coins"><span class="label">+</span> <span class="value">μ₿${formatNumber(entry.coins)}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    return Math.floor(seconds / 86400) + 'd';
}

// Track if balloon is currently popping (prevent double-pop)
let balloonPopping = false;

// Random balloon pop threshold (8-12 posts)
let balloonPopThreshold = Math.floor(Math.random() * 5) + 8; // 8-12

// Track when current balloon cycle started (so it always starts small)
let balloonCycleStart = 0;

/**
 * Update inflating balloon (random 8-12 posts = auto-pop bonus)
 * Balloon always starts small and grows until it pops
 */
function updatePostProgress() {
    const state = State.getState();

    // Safety check: reset balloon cycle if it's invalid (negative posts)
    if (balloonCycleStart > state.lifetimePosts) {
        console.log(`Balloon safety reset: cycleStart (${balloonCycleStart}) > lifetimePosts (${state.lifetimePosts})`);
        balloonCycleStart = state.lifetimePosts;
    }

    // Track posts since the current balloon cycle started
    const postsInCycle = Math.max(0, state.lifetimePosts - balloonCycleStart);
    const balloonContainer = document.getElementById('balloon-container');
    const balloonVisual = document.getElementById('balloon-visual');

    // Hide the countdown display (user doesn't want to know when it pops)
    if (postProgressCountEl) {
        postProgressCountEl.textContent = ''; // Don't show the number
    }

    if (!balloonContainer || !balloonVisual) return;

    // Calculate balloon size - visible growth from the start
    const baseSize = 35;
    const maxSize = 150;
    // Progress from 0 to 1 based on current threshold
    const progress = Math.min(postsInCycle / balloonPopThreshold, 1);
    // Use ease-out quadratic for visible early growth that accelerates
    // First half grows linearly, second half accelerates
    const easedProgress = progress < 0.5
        ? progress * 1.2  // Visible early growth
        : 0.6 + (progress - 0.5) * (progress - 0.5) * 1.6;  // Accelerate at end
    const clampedProgress = Math.min(easedProgress, 1);
    const currentSize = baseSize + clampedProgress * (maxSize - baseSize);
    balloonVisual.style.fontSize = currentSize + 'px';

    // Debug log
    console.log(`Balloon: ${postsInCycle}/${balloonPopThreshold} posts, size: ${currentSize.toFixed(0)}px`);

    // Calculate how close we are to popping (last 3 posts = intense)
    const postsUntilPop = balloonPopThreshold - postsInCycle;

    // Update balloon state classes and intensity
    // Only add movement/wobble animations in the last few posts before pop
    balloonContainer.classList.remove('ready', 'inflating', 'about-to-pop', 'critical', 'stage-1', 'stage-2', 'stage-3');

    if (postsInCycle >= balloonPopThreshold && !balloonPopping) {
        // Balloon reached threshold - AUTO POP!
        balloonPopping = true;
        balloonContainer.classList.add('ready');
        balloonVisual.style.fontSize = maxSize + 'px';

        // Dramatic pause before pop, then reset for next cycle
        setTimeout(() => {
            popBalloon();
            balloonPopping = false;
            // Get fresh state to ensure we have the latest lifetimePosts
            const freshState = State.getState();
            // Reset cycle start to current post count
            balloonCycleStart = freshState.lifetimePosts;
            // New random threshold for next balloon (8-12)
            balloonPopThreshold = Math.floor(Math.random() * 5) + 8;
            console.log(`Balloon reset: new cycle starts at ${balloonCycleStart} posts, next pop at ${balloonPopThreshold} more`);
        }, 400);
    } else if (postsUntilPop === 1) {
        // CRITICAL - about to burst! (last post before pop)
        balloonContainer.classList.add('critical');
        balloonVisual.style.filter = 'drop-shadow(0 0 25px rgba(255, 50, 50, 1)) hue-rotate(-20deg) saturate(1.5)';
    } else if (postsUntilPop <= 2) {
        // Almost ready - wobble intensifies! (2 posts left)
        balloonContainer.classList.add('about-to-pop');
        balloonVisual.style.filter = 'drop-shadow(0 0 15px rgba(255, 100, 100, 0.8)) hue-rotate(-10deg)';
    } else if (postsUntilPop <= 3) {
        // Starting to wobble (3 posts left) - noticeable glow
        balloonContainer.classList.add('inflating', 'stage-2');
        balloonVisual.style.filter = 'drop-shadow(0 0 8px rgba(255, 100, 100, 0.5))';
    } else if (postsInCycle > 0) {
        // Balloon is inflating - NO wobble, just grows silently
        balloonContainer.classList.add('inflating');
        // Just a subtle glow, no animation classes
        const glowIntensity = Math.min(progress * 0.3, 0.2);
        balloonVisual.style.filter = `drop-shadow(0 0 ${3 + progress * 5}px rgba(255, 100, 100, ${glowIntensity}))`;
    } else {
        // Reset - empty balloon (start of cycle)
        balloonVisual.style.filter = '';
    }
}

/**
 * Handle balloon click (pop for bonus)
 */
function handleBalloonClick(e) {
    const balloonContainer = document.getElementById('balloon-container');
    if (!balloonContainer || !balloonContainer.classList.contains('ready')) return;

    e.preventDefault();
    e.stopPropagation();

    // Pop the balloon!
    popBalloon();
}

/**
 * Pop balloon animation and give bonus - super rewarding!
 */
function popBalloon() {
    const balloonContainer = document.getElementById('balloon-container');
    const balloonVisual = document.getElementById('balloon-visual');
    if (!balloonContainer) return;

    const state = State.getState();
    const rect = balloonContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Hide the balloon immediately
    if (balloonVisual) {
        balloonVisual.style.opacity = '0';
    }

    // Create pop animation element (explosion effect)
    const popEl = document.createElement('div');
    popEl.className = 'balloon-pop';
    popEl.textContent = '💥';
    popEl.style.left = centerX - 50 + 'px';
    popEl.style.top = centerY - 50 + 'px';
    document.body.appendChild(popEl);

    // Create massive confetti burst
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#a29bfe', '#fd79a8', '#ff9f43', '#00d2d3'];
    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'balloon-confetti';
        confetti.style.left = centerX + 'px';
        confetti.style.top = centerY + 'px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        // Spread in all directions
        const angle = (i / 60) * Math.PI * 2;
        const distance = 150 + Math.random() * 180;
        confetti.style.setProperty('--x', (Math.cos(angle) * distance) + 'px');
        confetti.style.setProperty('--y', (Math.sin(angle) * distance - 50) + 'px');
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1500);
    }

    // COIN BURST! Spawn lots of golden coins flying out
    for (let i = 0; i < 25; i++) {
        const coin = document.createElement('div');
        coin.className = 'balloon-coin';
        coin.textContent = '🪙';
        coin.style.left = centerX + 'px';
        coin.style.top = centerY + 'px';
        coin.style.fontSize = (16 + Math.random() * 12) + 'px';
        // Random directions
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        coin.style.setProperty('--x', (Math.cos(angle) * distance) + 'px');
        coin.style.setProperty('--y', (Math.sin(angle) * distance - 30) + 'px');
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 1200);
    }

    // Remove pop element after animation
    setTimeout(() => popEl.remove(), 600);

    // Calculate bonus - increases with total posts
    const bonusMultiplier = 1 + Math.floor(state.lifetimePosts / 100) * 0.5;
    const bonusCoins = Math.floor(500 * state.globalMultiplier * bonusMultiplier);
    const bonusFollowers = Math.floor(50 * bonusMultiplier);

    // Award bonus
    State.addCoins(bonusCoins, 'balloon');
    State.addFollowers(bonusFollowers, 'balloon');

    // Track balloon pop for achievements
    State.updateState({ balloonPops: (state.balloonPops || 0) + 1 });

    // Play KACHING sound - super satisfying!
    playKachingSound();
    // Additional celebration sounds
    setTimeout(() => playSound('achievement'), 150);
    setTimeout(() => playSound('viral'), 300);

    // Particles - extra explosion
    spawnParticles('confetti', centerX, centerY, 100);
    spawnFloatingNumber(`+${formatNumber(bonusCoins)} μ₿`, centerX, centerY - 50, 'xcoins');
    spawnFloatingNumber(`+${bonusFollowers} Followers!`, centerX, centerY - 100, 'followers');
    spawnFloatingNumber('💰 KA-CHING! 💰', centerX, centerY - 150, 'viral');

    // Show notification
    showNotification('🎈💥 POP! +' + formatNumber(bonusCoins) + ' coins!', 'perfect');

    // Reset balloon after a brief delay
    setTimeout(() => {
        if (balloonVisual) {
            balloonVisual.style.opacity = '1';
            balloonVisual.style.fontSize = '35px';
            balloonVisual.style.filter = '';
        }
    }, 500);
}
/**
 * Update heat meter display
 */
function updateHeatMeter() {
    const heatMeter = document.getElementById('heat-meter');
    const heatFill = document.getElementById('heat-fill');
    const heatLevel = document.getElementById('heat-level');

    if (!heatMeter || !heatFill || !heatLevel) return;

    // Sync heat to state for achievements (only update if changed significantly)
    const state = State.getState();
    if (Math.abs(heatValue - (state.heat || 0)) >= 5) {
        State.updateState({ heat: heatValue }, true);
    }

    // Update fill width
    heatFill.style.width = heatValue + '%';

    // Update heat level class and text
    heatMeter.classList.remove('warm', 'hot', 'blazing');

    if (heatValue >= 80) {
        heatMeter.classList.add('blazing');
        heatLevel.textContent = 'BLAZING';
    } else if (heatValue >= 50) {
        heatMeter.classList.add('hot');
        heatLevel.textContent = 'HOT';
    } else if (heatValue >= 25) {
        heatMeter.classList.add('warm');
        heatLevel.textContent = 'WARM';
    } else {
        heatLevel.textContent = 'COLD';
    }
}

/**
 * Update rank display based on XP (lifetime posts)
 */
function updateRankDisplay() {
    const state = State.getState();
    const xp = state.lifetimePosts * 10; // 10 XP per post

    // Sync XP to state for achievements
    if (state.xp !== xp) {
        State.updateState({ xp: xp }, true);
    }

    // Find current rank
    let currentRank = RANKS[0];
    let nextRank = RANKS[1];

    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXP) {
            currentRank = RANKS[i];
            nextRank = RANKS[i + 1] || null;
            break;
        }
    }

    // Update display elements
    const rankIcon = document.getElementById('rank-icon');
    const rankName = document.getElementById('rank-name');
    const rankProgressFill = document.getElementById('rank-progress-fill');
    const rankXp = document.getElementById('rank-xp');

    if (rankIcon) rankIcon.textContent = currentRank.icon;
    if (rankName) rankName.textContent = currentRank.name;

    // Calculate progress to next rank
    if (nextRank && rankProgressFill && rankXp) {
        const xpIntoRank = xp - currentRank.minXP;
        const xpNeeded = nextRank.minXP - currentRank.minXP;
        const progress = (xpIntoRank / xpNeeded) * 100;
        rankProgressFill.style.width = progress + '%';
        rankXp.textContent = `${xp} / ${nextRank.minXP} XP`;
    } else if (rankProgressFill && rankXp) {
        // Max rank
        rankProgressFill.style.width = '100%';
        rankXp.textContent = `${xp} XP (MAX)`;
    }
}

