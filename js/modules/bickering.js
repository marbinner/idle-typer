/**
 * Bickering Challenge Module
 * Twitter argument mini-game where you type 3 replies to win an argument
 */

import * as State from '../state.js';
import { BICKERING_CONVERSATIONS, getRandomConversation } from '../data/bickering.js';
import { playSound } from './sound.js';
import { spawnParticles, spawnFloatingNumber } from './particles.js';
import { formatCoins, escapeHtml } from '../utils.js';

// Challenge state
let isActive = false;
let currentConversation = null;
let currentExchange = 0; // 0, 1, or 2
let typedIndex = 0;
let hasError = false;
let errorCount = 0;
let challengeStartTime = 0;
let exchangeStartTime = 0;
let replyReady = false; // Whether the reply area is shown
let opponentTyping = false; // Whether opponent is currently "typing"
let opponentTypedChars = 0; // How many chars of opponent message are visible
let opponentTypingInterval = null; // Interval for typing animation
const TYPING_INDICATOR_DELAY = 800; // ms before opponent starts "typing"
const CHARS_PER_SECOND = 25; // How fast opponent "types"

// Juice state - time pressure and combo
let comboCount = 0;
let maxCombo = 0;
let timerInterval = null;
let timeRemaining = 0;
let timeLimit = 20; // Will be calculated dynamically based on WPM
let urgentThreshold = 5; // Will be recalculated when timer starts
let criticalThreshold = 3; // Will be recalculated when timer starts
const DEFAULT_WPM = 40; // Fallback for new users
const MIN_TIME_LIMIT = 8; // Minimum time even for fast typers
const MAX_TIME_LIMIT = 45; // Maximum time for slow typers
let currentSpeed = 0; // chars per second
let lastCharTime = 0;

/**
 * Calculate time limit based on text length and user's average WPM
 * Calibrated so typing at 80% of avgWPM barely finishes in time
 */
function calculateTimeLimit(textLength) {
    const state = State.getState();
    const avgWPM = state.avgWPM > 0 ? state.avgWPM : DEFAULT_WPM;

    // At 80% of avgWPM:
    // chars/sec = 0.8 * avgWPM * 5 / 60 = 0.8 * avgWPM / 12
    // time = textLength / (0.8 * avgWPM / 12) = textLength * 15 / avgWPM
    const calculatedTime = (textLength * 15) / avgWPM;

    // Clamp between min and max
    return Math.max(MIN_TIME_LIMIT, Math.min(MAX_TIME_LIMIT, calculatedTime));
}

// DOM elements
let overlayEl = null;
let threadContainerEl = null;

// Character element cache for performance
let charElementCache = new Map();

// Cooldown tracking
let lastChallengeTime = 0;
const CHALLENGE_COOLDOWN = 60000; // 60 seconds between challenges

// Track if keyboard listener is registered to prevent orphaned listeners
let keyboardListenerRegistered = false;

// Trigger settings
const TRIGGER_CHANCE = 0.08; // 8% chance after each post
const MIN_POSTS_FOR_TRIGGER = 15; // Don't trigger until player has some experience

/**
 * Initialize the bickering system
 */
export function initBickering() {
    // Create the overlay element if it doesn't exist
    overlayEl = document.getElementById('bickering-overlay');
    if (!overlayEl) {
        console.warn('Bickering overlay not found in DOM');
        return;
    }

    // Set up close button handler
    const closeBtn = overlayEl.querySelector('.bickering-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', handleSkipChallenge);
    }

    // Set up skip button handler
    const skipBtn = overlayEl.querySelector('.bickering-skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', handleSkipChallenge);
    }

    // Expose test function to window for debugging (doesn't affect cooldown)
    window.testBickering = (category) => {
        startChallenge(category || null, true);
    };

    console.log('Bickering system initialized (use window.testBickering() to test)');
}

/**
 * Check if a bickering challenge should trigger
 * Call this after completing a post
 */
export function checkBickeringTrigger() {
    const state = State.getState();

    // Don't trigger if already in a challenge
    if (isActive) return false;

    // Don't trigger too early in the game
    if (state.lifetimePosts < MIN_POSTS_FOR_TRIGGER) return false;

    // Check cooldown
    const now = Date.now();
    if (now - lastChallengeTime < CHALLENGE_COOLDOWN) return false;

    // Random chance to trigger
    if (Math.random() < TRIGGER_CHANCE) {
        startChallenge();
        return true;
    }

    return false;
}

/**
 * Start a bickering challenge
 * @param {string} category - Optional category filter
 * @param {boolean} isDebug - If true, don't set cooldown (for testing)
 */
export function startChallenge(category = null, isDebug = false) {
    if (isActive) return;

    // Get a random conversation
    currentConversation = getRandomConversation(category);

    // Guard against invalid conversations (missing or empty exchanges)
    if (!currentConversation?.exchanges?.length) {
        console.warn('Bickering: Invalid conversation, aborting challenge');
        currentConversation = null;
        return;
    }

    currentExchange = 0;
    typedIndex = 0;
    hasError = false;
    errorCount = 0;
    replyReady = false; // Start with reply hidden
    challengeStartTime = Date.now();
    exchangeStartTime = Date.now();
    isActive = true;
    // Only set cooldown for natural triggers, not debug/test calls
    if (!isDebug) {
        lastChallengeTime = Date.now();
    }

    // Reset juice state
    comboCount = 0;
    maxCombo = 0;
    // timeLimit will be calculated when startTimer() is called
    timeRemaining = 0;
    timeLimit = 0;
    urgentThreshold = 5;
    criticalThreshold = 3;
    currentSpeed = 0;
    lastCharTime = 0;

    // Reset opponent typing state
    opponentTyping = false;
    opponentTypedChars = 0;

    // Show the overlay
    showOverlay();

    // Play dramatic entrance sound
    playSound('achievement', { pitch: 0.7 });

    // Start with typing indicator, then animate the opening tweet
    setTimeout(() => {
        if (!isActive) return;

        // Animate opponent typing their opening tweet
        startOpponentTyping(currentConversation.openingTweet, () => {
            if (!isActive) return;

            // Calculate timer values BEFORE rendering so the bar shows correctly
            const firstReply = currentConversation?.exchanges[currentExchange]?.playerReply || '';
            timeLimit = calculateTimeLimit(firstReply.length);
            timeRemaining = timeLimit;

            // Now show the player's reply area
            replyReady = true;
            renderThread();
            playSound('keystroke', { pitch: 1.2 });

            // Set up keyboard listener (track registration to prevent orphaned listeners)
            if (!keyboardListenerRegistered) {
                document.addEventListener('keydown', handleBickeringKeyDown);
                keyboardListenerRegistered = true;
            }
            exchangeStartTime = Date.now();
            lastCharTime = Date.now();

            // Start the countdown timer (will use already-set values)
            startTimer();
        });
    }, TYPING_INDICATOR_DELAY);

    console.log('Bickering challenge started:', currentConversation.id);
}

/**
 * Start the countdown timer
 * Note: timeLimit and timeRemaining should be set BEFORE calling this function
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    // Calculate urgency thresholds as percentages of time limit (store at module level)
    urgentThreshold = Math.min(5, timeLimit * 0.25); // 25% of time or 5s, whichever is smaller
    criticalThreshold = Math.min(3, timeLimit * 0.15); // 15% of time or 3s

    // Use pre-calculated values (set before renderThread for proper bar display)
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (!isActive || !replyReady) return;

        timeRemaining -= 0.1;
        updateTimerDisplay();

        // Add urgency effects as time runs low
        if (timeRemaining <= urgentThreshold && timeRemaining > 0) {
            const modal = overlayEl?.querySelector('.bickering-modal');
            if (modal) {
                modal.classList.add('urgent');
                if (timeRemaining <= criticalThreshold) {
                    modal.classList.add('critical');
                }
            }
        }

        // Time's up - YOU LOSE!
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            // Play defeat sound
            playSound('error', { pitch: 0.4 });

            // Big screen shake
            shakeScreen();

            // Show defeat screen
            setTimeout(() => {
                if (isActive) {
                    showDefeatUI();
                }
            }, 300);
        }
    }, 100);
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    const timerEl = document.getElementById('bickering-timer');
    const timerBarEl = document.getElementById('bickering-timer-bar');
    const timerFillEl = document.getElementById('timer-bar-fill');

    if (timerEl) {
        const seconds = Math.max(0, Math.ceil(timeRemaining));
        timerEl.textContent = seconds + 's';
    }

    // Update progress bar (guard against division by zero)
    if (timerFillEl) {
        const percent = timeLimit > 0 ? Math.max(0, (timeRemaining / timeLimit) * 100) : 100;
        timerFillEl.style.width = percent + '%';
    }

    // Color based on urgency (use dynamic thresholds from startTimer)
    if (timerBarEl) {
        if (timeRemaining <= criticalThreshold) {
            timerBarEl.className = 'bickering-timer-bar critical';
        } else if (timeRemaining <= urgentThreshold) {
            timerBarEl.className = 'bickering-timer-bar urgent';
        } else {
            timerBarEl.className = 'bickering-timer-bar';
        }
    }
}

/**
 * Shake the screen for emphasis
 */
function shakeScreen() {
    const modal = overlayEl?.querySelector('.bickering-modal');
    if (modal) {
        modal.classList.add('shake');
        setTimeout(() => modal.classList.remove('shake'), 300);
    }
}

/**
 * Show the bickering overlay
 */
function showOverlay() {
    if (!overlayEl) return;

    // Use class toggle only - CSS handles display via .active class
    overlayEl.classList.add('active');

    // Cache the thread container
    threadContainerEl = overlayEl.querySelector('.bickering-thread');
}

/**
 * Start the opponent typing animation
 * @param {string} text - The text the opponent will "type"
 * @param {function} onComplete - Callback when typing is done
 */
function startOpponentTyping(text, onComplete) {
    if (opponentTypingInterval) clearInterval(opponentTypingInterval);

    opponentTyping = true;
    opponentTypedChars = 0;
    renderThread();

    // Play typing indicator sound
    playSound('keystroke', { pitch: 0.7 });

    const intervalMs = 1000 / CHARS_PER_SECOND;
    opponentTypingInterval = setInterval(() => {
        if (!isActive) {
            clearInterval(opponentTypingInterval);
            opponentTypingInterval = null;
            return;
        }

        opponentTypedChars++;

        // Update the displayed text
        const textEl = document.getElementById('opponent-typing-text');
        if (textEl) {
            textEl.textContent = text.substring(0, opponentTypedChars);
        }

        // Occasional keystroke sound
        if (opponentTypedChars % 5 === 0) {
            playSound('keystroke', { pitch: 0.6 + Math.random() * 0.2 });
        }

        // Done typing
        if (opponentTypedChars >= text.length) {
            clearInterval(opponentTypingInterval);
            opponentTypingInterval = null;
            opponentTyping = false;

            // Small delay then show reply area
            setTimeout(() => {
                if (isActive && onComplete) {
                    onComplete();
                }
            }, 400);
        }
    }, intervalMs);
}

/**
 * Stop opponent typing animation
 */
function stopOpponentTyping() {
    if (opponentTypingInterval) {
        clearInterval(opponentTypingInterval);
        opponentTypingInterval = null;
    }
    opponentTyping = false;
}

/**
 * Hide the bickering overlay
 */
function hideOverlay() {
    if (!overlayEl) return;

    // Use class toggle only - CSS handles display via .active class
    overlayEl.classList.remove('active');
}

/**
 * Render the Twitter thread UI
 */
function renderThread() {
    if (!threadContainerEl || !currentConversation) return;

    const { opponent, openingTweet, exchanges } = currentConversation;

    let html = '';

    // Determine what text to show for opening tweet
    const isTypingOpening = opponentTyping && currentExchange === 0 && !replyReady;
    const openingText = isTypingOpening
        ? openingTweet.substring(0, opponentTypedChars)
        : openingTweet;

    // Opponent's opening tweet (with typing animation)
    html += `
        <div class="bickering-tweet opponent-tweet ${isTypingOpening ? 'typing-active' : ''}">
            <div class="tweet-avatar">${opponent.icon}</div>
            <div class="tweet-content">
                <div class="tweet-header">
                    <span class="tweet-name">${escapeHtml(opponent.name)}</span>
                    <span class="tweet-handle">${escapeHtml(opponent.handle)}</span>
                    ${isTypingOpening ? '<span class="typing-indicator">typing</span>' : ''}
                </div>
                <div class="tweet-text" ${isTypingOpening ? 'id="opponent-typing-text"' : ''}>${escapeHtml(openingText)}${isTypingOpening ? '<span class="typing-cursor">|</span>' : ''}</div>
            </div>
        </div>
    `;

    // Render completed exchanges
    for (let i = 0; i < currentExchange; i++) {
        const exchange = exchanges[i];

        // Player's reply (completed)
        html += `
            <div class="bickering-tweet player-tweet completed">
                <div class="tweet-connector"></div>
                <div class="tweet-avatar">😎</div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="tweet-name">You</span>
                        <span class="tweet-handle">@shitposthero</span>
                    </div>
                    <div class="tweet-text">${escapeHtml(exchange.playerReply)}</div>
                </div>
            </div>
        `;

        // Check if this opponent response should be animated (last completed exchange, not ready for reply yet)
        const isLastCompletedExchange = i === currentExchange - 1;
        const isTypingThisResponse = opponentTyping && isLastCompletedExchange && !replyReady;

        // Don't render opponent response if it's pending animation (would flash before typing starts)
        const isPendingAnimation = isLastCompletedExchange && !replyReady && !opponentTyping;
        if (isPendingAnimation) {
            // Skip rendering - will show when typing animation starts
            continue;
        }

        const responseText = isTypingThisResponse
            ? exchange.opponentResponse.substring(0, opponentTypedChars)
            : exchange.opponentResponse;

        // Opponent's response
        html += `
            <div class="bickering-tweet opponent-tweet ${isTypingThisResponse ? 'typing-active' : ''}">
                <div class="tweet-connector"></div>
                <div class="tweet-avatar">${opponent.icon}</div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="tweet-name">${escapeHtml(opponent.name)}</span>
                        <span class="tweet-handle">${escapeHtml(opponent.handle)}</span>
                        ${isTypingThisResponse ? '<span class="typing-indicator">typing</span>' : ''}
                    </div>
                    <div class="tweet-text" ${isTypingThisResponse ? 'id="opponent-typing-text"' : ''}>${escapeHtml(responseText)}${isTypingThisResponse ? '<span class="typing-cursor">|</span>' : ''}</div>
                </div>
            </div>
        `;
    }

    // Current exchange (if not complete and reply is ready)
    if (currentExchange < exchanges.length && replyReady) {
        const currentReply = exchanges[currentExchange].playerReply;

        // Player's current reply (typing area)
        // Guard against NaN if timeLimit is 0
        const timerPercent = timeLimit > 0 ? Math.max(0, Math.min(100, (timeRemaining / timeLimit) * 100)) : 100;
        html += `
            <div class="bickering-tweet player-tweet typing">
                <div class="tweet-connector"></div>
                <div class="tweet-avatar">😎</div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="tweet-name">You</span>
                        <span class="tweet-handle">@shitposthero</span>
                        <div class="bickering-hud">
                            <span id="bickering-combo" class="bickering-combo"></span>
                            <span class="reply-counter">${currentExchange + 1}/3</span>
                        </div>
                    </div>
                    <div class="tweet-text typing-area" id="bickering-typing-area">${renderTypingText(currentReply)}</div>
                    <div class="bickering-timer-bar" id="bickering-timer-bar">
                        <div class="timer-bar-fill" id="timer-bar-fill" style="width: ${timerPercent}%; background-color: #1d9bf0;"></div>
                        <span class="timer-bar-text" id="bickering-timer">${Math.ceil(timeRemaining)}s</span>
                    </div>
                </div>
            </div>
        `;
    }

    threadContainerEl.innerHTML = html;

    // Cache character elements
    charElementCache.clear();
    const typingArea = document.getElementById('bickering-typing-area');
    if (typingArea) {
        typingArea.querySelectorAll('[data-index]').forEach(el => {
            charElementCache.set(parseInt(el.dataset.index, 10), el);
        });
    }

    // Scroll to bottom of thread
    threadContainerEl.scrollTop = threadContainerEl.scrollHeight;
}

/**
 * Render the typing text with character spans
 * Words are wrapped in containers to prevent mid-word line breaks
 */
function renderTypingText(text) {
    let html = '';
    let charIndex = 0;

    // Split text by whitespace, keeping the whitespace as separate tokens
    const tokens = text.split(/(\s+)/);

    tokens.forEach(token => {
        if (!token) return;

        const isWhitespace = /^\s+$/.test(token);

        if (isWhitespace) {
            // Render spaces directly (allow line breaks after spaces)
            for (let i = 0; i < token.length; i++) {
                let className = 'bicker-char';
                if (charIndex < typedIndex) {
                    className += ' typed';
                } else if (charIndex === typedIndex) {
                    className += ' current';
                }
                html += `<span class="${className}" data-index="${charIndex}">&nbsp;</span>`;
                charIndex++;
            }
        } else {
            // Wrap word in a container to prevent breaking
            html += '<span class="word">';
            for (let i = 0; i < token.length; i++) {
                let className = 'bicker-char';
                if (charIndex < typedIndex) {
                    className += ' typed';
                } else if (charIndex === typedIndex) {
                    className += ' current';
                }
                const displayChar = escapeHtml(token[i]);
                html += `<span class="${className}" data-index="${charIndex}">${displayChar}</span>`;
                charIndex++;
            }
            html += '</span>';
        }
    });

    return html;
}

/**
 * Handle keyboard input during bickering
 */
function handleBickeringKeyDown(event) {
    if (!isActive || !currentConversation) return;

    // Check bounds - currentExchange might be beyond array after completing all exchanges
    if (currentExchange >= currentConversation.exchanges.length) return;

    // Ignore modifier keys
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Allow Escape to skip challenge
    if (event.key === 'Escape') {
        handleSkipChallenge();
        return;
    }

    // Ignore certain keys
    const ignoredKeys = ['Tab', 'CapsLock', 'Shift', 'Control', 'Alt', 'Meta'];
    if (ignoredKeys.includes(event.key)) return;

    // Prevent default for space
    if (event.key === ' ' || event.key === "'" || event.key === '/') {
        event.preventDefault();
    }

    const currentReply = currentConversation.exchanges[currentExchange].playerReply;
    if (typedIndex >= currentReply.length) return;

    const expectedChar = currentReply[typedIndex];
    const typedChar = event.key;

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
    const charEl = charElementCache.get(typedIndex);

    if (charEl) {
        charEl.classList.remove('current', 'error');
        charEl.classList.add('typed');
    }

    typedIndex++;
    hasError = false;

    // Update combo
    comboCount++;
    if (comboCount > maxCombo) maxCombo = comboCount;

    // Calculate speed
    const now = Date.now();
    if (lastCharTime > 0) {
        const timeDiff = (now - lastCharTime) / 1000;
        if (timeDiff > 0) {
            currentSpeed = Math.min(15, 1 / timeDiff); // Cap at 15 chars/sec
        }
    }
    lastCharTime = now;

    // Update combo display
    updateComboDisplay();

    // Add time bonus for combos (proportional to time limit, max 10% of timeLimit)
    if (comboCount > 0 && comboCount % 10 === 0) {
        const bonus = Math.max(1, Math.min(2, timeLimit * 0.1));
        timeRemaining = Math.min(timeLimit, timeRemaining + bonus);
        // Flash bonus notification
        showTimeBonus(`+${bonus.toFixed(0)}s`);
    }

    // Update next character
    const nextCharEl = charElementCache.get(typedIndex);
    if (nextCharEl) {
        nextCharEl.classList.add('current');
    }

    // Play keystroke sound with combo pitch scaling
    const comboPitch = Math.min(1.5, 1.0 + (comboCount * 0.02));
    playSound('keystroke', { pitch: comboPitch });

    // Spawn small particle on high combo
    if (comboCount > 5 && comboCount % 5 === 0) {
        const typingArea = document.getElementById('bickering-typing-area');
        if (typingArea) {
            const rect = typingArea.getBoundingClientRect();
            spawnParticles('keystroke', rect.left + rect.width / 2, rect.top, 3);
        }
    }

    // Check if reply is complete
    const currentReply = currentConversation.exchanges[currentExchange].playerReply;
    if (typedIndex >= currentReply.length) {
        completeExchange();
    }
}

/**
 * Handle incorrect character typed
 */
function handleIncorrectChar() {
    const charEl = charElementCache.get(typedIndex);

    if (charEl) {
        charEl.classList.add('error');
        charEl.classList.add('shake');
        setTimeout(() => charEl.classList.remove('shake'), 200);
    }

    hasError = true;
    errorCount++;

    // Reset combo
    comboCount = 0;
    updateComboDisplay();

    // Screen shake on error
    shakeScreen();

    // Play error sound
    playSound('error', { pitch: 0.8 });
}

/**
 * Update the combo display
 */
function updateComboDisplay() {
    const comboEl = document.getElementById('bickering-combo');
    if (comboEl) {
        if (comboCount >= 5) {
            comboEl.textContent = `${comboCount}x`;
            comboEl.className = 'bickering-combo active';
            if (comboCount >= 20) {
                comboEl.classList.add('fire');
            } else if (comboCount >= 10) {
                comboEl.classList.add('hot');
            }
        } else {
            comboEl.className = 'bickering-combo';
            comboEl.textContent = '';
        }
    }
}

/**
 * Show time bonus notification
 */
function showTimeBonus(text) {
    const timerEl = document.getElementById('bickering-timer');
    if (timerEl) {
        timerEl.classList.add('bonus');
        setTimeout(() => timerEl.classList.remove('bonus'), 500);
    }
}

/**
 * Complete the current exchange and move to next
 */
function completeExchange() {
    playSound('complete', { pitch: 1.1 + (currentExchange * 0.1) });

    // Stop timer during transition
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Remove urgency classes
    const modal = overlayEl?.querySelector('.bickering-modal');
    if (modal) {
        modal.classList.remove('urgent', 'critical');
    }

    // Small particle burst
    const typingArea = document.getElementById('bickering-typing-area');
    if (typingArea) {
        const rect = typingArea.getBoundingClientRect();
        spawnParticles('complete', rect.left + rect.width / 2, rect.top, 15);
    }

    // Get opponent's response text BEFORE incrementing currentExchange
    const opponentResponse = currentConversation.exchanges[currentExchange].opponentResponse;

    currentExchange++;
    typedIndex = 0;
    replyReady = false; // Hide next reply until opponent responds

    // Check if challenge is complete
    if (currentExchange >= currentConversation.exchanges.length) {
        // Show completed reply, then celebrate
        renderThread();
        setTimeout(() => {
            completeChallenge();
        }, 400);
    } else {
        // Show completed reply first
        renderThread();

        // After a moment, start opponent typing animation
        setTimeout(() => {
            if (!isActive) return;

            // Animate opponent typing their response
            startOpponentTyping(opponentResponse, () => {
                if (!isActive) return;

                // Calculate timer values BEFORE rendering so the bar shows correctly
                const nextReply = currentConversation?.exchanges[currentExchange]?.playerReply || '';
                timeLimit = calculateTimeLimit(nextReply.length);
                timeRemaining = timeLimit;

                // Now show the player's reply area
                replyReady = true;
                renderThread();
                playSound('keystroke', { pitch: 1.2 });
                exchangeStartTime = Date.now();
                lastCharTime = Date.now();

                // Reset and restart timer for next exchange
                startTimer();
            });
        }, 300);
    }
}

/**
 * Complete the entire challenge
 */
function completeChallenge() {
    if (!isActive) return;

    const state = State.getState();
    const totalTime = (Date.now() - challengeStartTime) / 1000;

    // Calculate rewards based on performance
    const baseReward = state.coinsPerPost * 5; // 5x normal post reward
    const difficultyMultiplier = {
        'easy': 1,
        'medium': 1.5,
        'hard': 2
    }[currentConversation.difficulty] || 1;

    // Accuracy bonus (fewer errors = more coins)
    const totalChars = currentConversation.exchanges.reduce((sum, e) => sum + e.playerReply.length, 0);
    const accuracy = Math.max(0, 1 - (errorCount / totalChars));
    const accuracyBonus = 1 + (accuracy * 0.5); // Up to 50% bonus for perfect

    // Speed bonus (faster = more coins)
    const avgCharsPerSecond = totalChars / totalTime;
    const speedBonus = Math.min(2, 1 + (avgCharsPerSecond / 10)); // Up to 2x for fast typing

    // Calculate final rewards
    const coinReward = Math.floor(baseReward * difficultyMultiplier * accuracyBonus * speedBonus);
    const followerReward = Math.floor(5 * difficultyMultiplier * accuracyBonus);
    const impressionReward = Math.floor(100 * difficultyMultiplier);

    // Apply rewards
    State.addCoins(coinReward, 'bickering');
    State.addFollowers(followerReward, 'bickering');
    State.addImpressions(impressionReward);

    // Track stats
    State.updateState({
        bickeringWins: (state.bickeringWins || 0) + 1
    });

    // Show victory UI
    showVictoryUI(coinReward, followerReward, accuracy, totalTime);

    // Big celebration effects
    playSound('viral', { pitch: 1.2 });

    // Spawn lots of particles
    if (threadContainerEl) {
        const rect = threadContainerEl.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                spawnParticles('viral',
                    rect.left + Math.random() * rect.width,
                    rect.top + Math.random() * rect.height,
                    15
                );
            }, i * 100);
        }
    }

    // Spawn floating numbers
    spawnFloatingNumber(`+${formatCoins(coinReward).full}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');

    console.log(`Bickering challenge complete! Coins: ${coinReward}, Followers: ${followerReward}, Accuracy: ${(accuracy * 100).toFixed(1)}%`);
}

/**
 * Show victory UI with results
 */
function showVictoryUI(coins, followers, accuracy, time) {
    if (!threadContainerEl) return;

    const accuracyPercent = (accuracy * 100).toFixed(1);
    const timeStr = time.toFixed(1);

    // Determine victory flavor text
    let flavorText = 'has been ratio\'d into submission';
    if (accuracy >= 0.95 && time < 30) {
        flavorText = 'has been absolutely DESTROYED';
    } else if (maxCombo >= 30) {
        flavorText = 'couldn\'t handle your combo streak';
    } else if (accuracy >= 0.9) {
        flavorText = 'has logged off in shame';
    }

    // Add victory message to thread
    const victoryHtml = `
        <div class="bickering-victory">
            <div class="victory-title">🏆 ARGUMENT WON! 🏆</div>
            <div class="victory-subtitle">${escapeHtml(currentConversation.opponent.name)} ${flavorText}</div>
            <div class="victory-stats">
                <div class="victory-stat coins">
                    <span class="stat-value">${formatCoins(coins).full}</span>
                    <span class="stat-label">Coins Earned</span>
                </div>
                <div class="victory-stat followers">
                    <span class="stat-value">+${followers}</span>
                    <span class="stat-label">New Followers</span>
                </div>
                <div class="victory-stat">
                    <span class="stat-value">${accuracyPercent}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
                <div class="victory-stat combo">
                    <span class="stat-value">${maxCombo}x</span>
                    <span class="stat-label">Max Combo</span>
                </div>
                <div class="victory-stat">
                    <span class="stat-value">${timeStr}s</span>
                    <span class="stat-label">Time</span>
                </div>
            </div>
            <button class="bickering-done-btn">Continue Posting</button>
        </div>
    `;

    threadContainerEl.insertAdjacentHTML('beforeend', victoryHtml);
    threadContainerEl.scrollTop = threadContainerEl.scrollHeight;

    // Add event listener to the done button (instead of inline onclick)
    const doneBtn = threadContainerEl.querySelector('.bickering-done-btn');
    if (doneBtn) {
        doneBtn.addEventListener('click', endChallenge);
    }

    // Add keyboard listener to dismiss with Enter, Space, or Escape
    document.addEventListener('keydown', handleEndScreenKeyDown);
}

/**
 * Show defeat UI - player ran out of time
 */
function showDefeatUI() {
    if (!threadContainerEl || !currentConversation) return;

    // Stop keyboard input (only if registered)
    if (keyboardListenerRegistered) {
        document.removeEventListener('keydown', handleBickeringKeyDown);
        keyboardListenerRegistered = false;
    }

    // Random humiliation messages
    const humiliations = [
        'You got RATIOED into oblivion',
        'Your typing was too slow, L + ratio',
        'They\'re screenshot-ing this for clout',
        'This is going viral... for the wrong reasons',
        'You\'ve been publicly owned',
        'Your followers are unfollowing in real-time',
        'This will haunt your timeline forever'
    ];
    const humiliation = humiliations[Math.floor(Math.random() * humiliations.length)];

    // Opponent's victory taunt
    const taunts = [
        'lmaooo couldn\'t even finish typing 💀',
        'ratio + you\'re slow + L',
        'this you? 📸🤣',
        'bro buffered mid-argument',
        'imagine losing a twitter beef to lag',
        'skill issue tbh'
    ];
    const taunt = taunts[Math.floor(Math.random() * taunts.length)];

    const defeatHtml = `
        <div class="bickering-tweet opponent-tweet">
            <div class="tweet-connector"></div>
            <div class="tweet-avatar">${currentConversation.opponent.icon}</div>
            <div class="tweet-content">
                <div class="tweet-header">
                    <span class="tweet-name">${escapeHtml(currentConversation.opponent.name)}</span>
                    <span class="tweet-handle">${escapeHtml(currentConversation.opponent.handle)}</span>
                </div>
                <div class="tweet-text">${escapeHtml(taunt)}</div>
            </div>
        </div>
        <div class="bickering-defeat">
            <div class="defeat-title">💀 YOU LOST 💀</div>
            <div class="defeat-subtitle">${humiliation}</div>
            <div class="defeat-stats">
                <div class="defeat-stat">
                    <span class="stat-value">⏱️ TIME OUT</span>
                </div>
                <div class="defeat-stat">
                    <span class="stat-value">${currentExchange}/3</span>
                    <span class="stat-label">Replies Made</span>
                </div>
                <div class="defeat-stat">
                    <span class="stat-value">${maxCombo}x</span>
                    <span class="stat-label">Max Combo</span>
                </div>
            </div>
            <button class="bickering-done-btn defeat-btn">Slink Away in Shame</button>
        </div>
    `;

    threadContainerEl.insertAdjacentHTML('beforeend', defeatHtml);
    threadContainerEl.scrollTop = threadContainerEl.scrollHeight;

    // Add event listener to the done button
    const doneBtn = threadContainerEl.querySelector('.defeat-btn');
    if (doneBtn) {
        doneBtn.addEventListener('click', endChallenge);
    }

    // Add keyboard listener to dismiss with Enter, Space, or Escape
    document.addEventListener('keydown', handleEndScreenKeyDown);

    console.log('Bickering challenge lost - timed out!');
}

/**
 * Handle keyboard input on end screen (victory/defeat)
 */
function handleEndScreenKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
        event.preventDefault();
        document.removeEventListener('keydown', handleEndScreenKeyDown);
        endChallenge();
    }
}

/**
 * Handle skipping the challenge
 */
function handleSkipChallenge() {
    if (!isActive) return;

    // Small penalty for skipping - no rewards
    console.log('Bickering challenge skipped');

    endChallenge();
}

/**
 * End the challenge and clean up
 */
function endChallenge() {
    isActive = false;
    currentConversation = null;
    currentExchange = 0;
    typedIndex = 0;
    replyReady = false;
    hasError = false;
    errorCount = 0;
    comboCount = 0;
    maxCombo = 0;
    charElementCache.clear();

    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Stop opponent typing animation
    stopOpponentTyping();

    // Remove urgency classes
    const modal = overlayEl?.querySelector('.bickering-modal');
    if (modal) {
        modal.classList.remove('urgent', 'critical', 'shake');
    }

    // Remove keyboard listeners (only if registered)
    if (keyboardListenerRegistered) {
        document.removeEventListener('keydown', handleBickeringKeyDown);
        keyboardListenerRegistered = false;
    }
    document.removeEventListener('keydown', handleEndScreenKeyDown);

    // Hide overlay
    hideOverlay();

    // Emit event to signal challenge ended - typing module will load new post
    window.dispatchEvent(new CustomEvent('bickering-ended'));
}

/**
 * Check if a bickering challenge is currently active
 */
export function isBickeringActive() {
    return isActive;
}

/**
 * Get current challenge state (for debugging)
 */
export function getChallengeState() {
    return {
        isActive,
        conversation: currentConversation?.id,
        exchange: currentExchange,
        typedIndex,
        errorCount
    };
}
