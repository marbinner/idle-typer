/**
 * Events Module
 * Random events that add excitement and bonuses
 */

import * as State from '../state.js';
import { playSound } from './sound.js';
import { spawnParticles, screenFlash } from './particles.js';

// Event definitions
const EVENTS = {
    elonWatching: {
        id: 'elonWatching',
        name: 'Elon is Watching!',
        icon: '👀',
        description: '2x coins for 30 seconds!',
        duration: 30000,
        effect: { coinMultiplier: 2 },
        rarity: 0.15
    },
    viralMoment: {
        id: 'viralMoment',
        name: 'Viral Moment!',
        icon: '🔥',
        description: 'Next 5 posts get bonus followers!',
        duration: 0,
        effect: { viralPosts: 5 },
        rarity: 0.2
    },
    algorithmBoost: {
        id: 'algorithmBoost',
        name: 'Algorithm Boost!',
        icon: '📈',
        description: '50% higher viral chance for 1 minute!',
        duration: 60000,
        effect: { viralChanceBonus: 0.5 },
        rarity: 0.2
    },
    trendingTopic: {
        id: 'trendingTopic',
        name: 'Trending Topic!',
        icon: '#️⃣',
        description: 'Your posts are trending! 3x impressions!',
        duration: 45000,
        effect: { impressionMultiplier: 3 },
        rarity: 0.15
    },
    goldenHour: {
        id: 'goldenHour',
        name: 'Golden Hour!',
        icon: '✨',
        description: 'All characters are golden for 20 seconds!',
        duration: 20000,
        effect: { allGolden: true },
        rarity: 0.1
    },
    botSurge: {
        id: 'botSurge',
        name: 'Bot Surge!',
        icon: '🤖',
        description: '3x bot output for 45 seconds!',
        duration: 45000,
        effect: { botMultiplier: 3 },
        rarity: 0.15
    },
    followerFrenzy: {
        id: 'followerFrenzy',
        name: 'Follower Frenzy!',
        icon: '👥',
        description: '5x followers for 30 seconds!',
        duration: 30000,
        effect: { followerMultiplier: 5 },
        rarity: 0.1
    }
};

// Active events
let activeEvents = [];
let eventCheckInterval = null;
let lastEventTime = 0;
const MIN_EVENT_INTERVAL = 60000; // Minimum 1 minute between events

// Floating bonus state
let floatingBonusElement = null;
let floatingBonusInterval = null;
let floatingBonusTimeout = null;
let floatingBonusAnimationId = null;
let bonusModeEndTime = 0;
let bonusModeTimerInterval = null;
const FLOATING_BONUS_SPAWN_INTERVAL = 45000; // Check every 45 seconds
const FLOATING_BONUS_DURATION = 15000; // Bonus stays visible for 15 seconds
const BONUS_MODE_DURATION = 120000; // 2 minutes of 5x bonus

/**
 * Initialize the events system
 */
export function initEvents() {
    // Check for random events every 15 seconds
    eventCheckInterval = setInterval(checkForRandomEvent, 15000);

    // Check for floating bonus spawn every 45 seconds
    floatingBonusInterval = setInterval(checkForFloatingBonus, FLOATING_BONUS_SPAWN_INTERVAL);

    // Subscribe to state for event effects
    State.subscribe(applyActiveEventEffects);

    console.log('Events system initialized');
}

/**
 * Check if a random event should trigger
 * Events unlock at 75 posts to avoid overwhelming new players
 */
function checkForRandomEvent() {
    const now = Date.now();
    const state = State.getState();

    // Don't trigger events too frequently
    if (now - lastEventTime < MIN_EVENT_INTERVAL) return;

    // Events unlock at 75 posts
    if (state.totalPosts < 75) return;

    // Base 5% chance per check, increases with activity
    const baseChance = 0.05;
    const activityBonus = Math.min(state.combo * 0.001, 0.05); // Up to +5% from combo

    if (Math.random() < baseChance + activityBonus) {
        triggerRandomEvent();
        lastEventTime = now;
    }
}

/**
 * Trigger a random event
 */
function triggerRandomEvent() {
    // Filter to events not currently active
    const availableEvents = Object.values(EVENTS).filter(e =>
        !activeEvents.find(ae => ae.id === e.id)
    );

    if (availableEvents.length === 0) return;

    // Weighted random selection based on rarity
    const totalRarity = availableEvents.reduce((sum, e) => sum + e.rarity, 0);
    let random = Math.random() * totalRarity;

    let selectedEvent = availableEvents[0];
    for (const event of availableEvents) {
        random -= event.rarity;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }

    activateEvent(selectedEvent);
}

/**
 * Activate an event
 */
function activateEvent(event) {
    // Play sound and effects
    playSound('viral');
    screenFlash('gold');

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;
    spawnParticles('confetti', centerX, centerY, 50);

    // Show event notification
    showEventNotification(event);

    // Add to active events
    const activeEvent = {
        ...event,
        startTime: Date.now(),
        endTime: event.duration > 0 ? Date.now() + event.duration : null
    };
    activeEvents.push(activeEvent);

    // Update state with active event effects
    applyActiveEventEffects();

    // Set timeout to end event
    if (event.duration > 0) {
        setTimeout(() => {
            endEvent(event.id);
        }, event.duration);
    }

    // Update event ticker
    updateEventTicker(event.name + ' - ' + event.description);
}

/**
 * End an active event
 */
function endEvent(eventId) {
    activeEvents = activeEvents.filter(e => e.id !== eventId);
    applyActiveEventEffects();

    if (activeEvents.length === 0) {
        updateEventTicker('Keep typing to trigger more events!');
    } else {
        const remaining = activeEvents[0];
        updateEventTicker(remaining.name + ' active!');
    }
}

/**
 * Apply effects from all active events to state
 */
function applyActiveEventEffects() {
    let coinMult = 1;
    let followerMult = 1;
    let impressionMult = 1;
    let viralBonus = 0;
    let botMult = 1;
    let allGolden = false;
    let bonusViralPosts = 0;

    for (const event of activeEvents) {
        if (event.effect.coinMultiplier) coinMult *= event.effect.coinMultiplier;
        if (event.effect.followerMultiplier) followerMult *= event.effect.followerMultiplier;
        if (event.effect.impressionMultiplier) impressionMult *= event.effect.impressionMultiplier;
        if (event.effect.viralChanceBonus) viralBonus += event.effect.viralChanceBonus;
        if (event.effect.botMultiplier) botMult *= event.effect.botMultiplier;
        if (event.effect.allGolden) allGolden = true;
        if (event.effect.viralPosts) bonusViralPosts += event.effect.viralPosts;
    }

    State.updateState({
        eventCoinMultiplier: coinMult,
        eventFollowerMultiplier: followerMult,
        eventImpressionMultiplier: impressionMult,
        eventViralBonus: viralBonus,
        eventBotMultiplier: botMult,
        eventAllGolden: allGolden,
        eventBonusViralPosts: bonusViralPosts
    }, true);
}

/**
 * Show event notification popup
 */
function showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'event-notification animate-slide-in-top';
    notification.innerHTML =
        '<div class="event-notification-icon">' + event.icon + '</div>' +
        '<div class="event-notification-content">' +
            '<div class="event-notification-title">' + event.name + '</div>' +
            '<div class="event-notification-desc">' + event.description + '</div>' +
        '</div>';

    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/**
 * Update the event ticker
 */
function updateEventTicker(message) {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
        eventText.classList.add('highlight');
        setTimeout(() => eventText.classList.remove('highlight'), 2000);
    }
}

/**
 * Get active events
 */
export function getActiveEvents() {
    return activeEvents;
}

/**
 * Check if a specific effect is active
 */
export function isEffectActive(effectName) {
    return activeEvents.some(e => e.effect[effectName]);
}

/**
 * Manually trigger an event (for testing or special occasions)
 */
export function triggerEvent(eventId) {
    const event = EVENTS[eventId];
    if (event) {
        activateEvent(event);
    }
}

/**
 * Check if floating bonus should spawn
 * Unlocks at 100 posts (after all other mechanics)
 */
function checkForFloatingBonus() {
    // Don't spawn if one is already visible or bonus mode is active
    if (floatingBonusElement || bonusModeEndTime > Date.now()) return;

    const state = State.getState();

    // Floating bonus unlocks at 100 posts
    if (state.totalPosts < 100) return;

    // 30% chance to spawn when checked
    if (Math.random() < 0.30) {
        spawnFloatingBonus();
    }
}

/**
 * Spawn a floating clickable bonus element
 */
function spawnFloatingBonus() {
    if (floatingBonusElement) return;

    // Create the floating bonus element - X/Twitter themed
    const bonusTypes = [
        { icon: '𝕏', name: 'X Boost', color: '#fff' },
        { icon: '🔷', name: 'Blue Check Power', color: '#1d9bf0' },
        { icon: '⚡', name: 'Lightning Round', color: '#ffd700' },
        { icon: '🐦', name: 'Bird Mode', color: '#1d9bf0' },
        { icon: '🚀', name: 'To The Moon', color: '#ff6b6b' }
    ];
    const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

    floatingBonusElement = document.createElement('div');
    floatingBonusElement.className = 'floating-bonus';
    floatingBonusElement.innerHTML = `
        <div class="floating-bonus-inner">
            <span class="floating-bonus-icon">${bonusType.icon}</span>
            <span class="floating-bonus-text">CLICK ME!</span>
        </div>
    `;
    floatingBonusElement.style.setProperty('--bonus-color', bonusType.color);
    floatingBonusElement.dataset.bonusName = bonusType.name;

    // Random starting position
    const startX = Math.random() * (window.innerWidth - 100);
    const startY = Math.random() * (window.innerHeight - 200) + 100;
    floatingBonusElement.style.left = startX + 'px';
    floatingBonusElement.style.top = startY + 'px';

    // Add click handler
    floatingBonusElement.addEventListener('click', handleFloatingBonusClick);

    document.body.appendChild(floatingBonusElement);

    // Start floating animation
    animateFloatingBonus();

    // Set timeout to remove if not clicked
    floatingBonusTimeout = setTimeout(() => {
        removeFloatingBonus();
    }, FLOATING_BONUS_DURATION);

    // Play a subtle sound to alert player
    playSound('keystroke', { pitch: 1.5 });
}

/**
 * Animate the floating bonus element
 */
function animateFloatingBonus() {
    if (!floatingBonusElement) return;

    // Cancel any existing animation
    if (floatingBonusAnimationId) {
        cancelAnimationFrame(floatingBonusAnimationId);
        floatingBonusAnimationId = null;
    }

    // Floating animation with sinusoidal movement
    let time = 0;
    const animate = () => {
        if (!floatingBonusElement) {
            floatingBonusAnimationId = null;
            return;
        }

        time += 0.02;

        // Gentle floating movement
        const xOffset = Math.sin(time * 2) * 30;
        const yOffset = Math.cos(time * 1.5) * 20;

        // parseFloat returns NaN for empty strings, provide defaults
        const currentLeft = parseFloat(floatingBonusElement.style.left) || window.innerWidth / 2;
        const currentTop = parseFloat(floatingBonusElement.style.top) || window.innerHeight / 2;

        // Keep within bounds
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;
        const minY = 80;

        let newX = currentLeft + xOffset * 0.1;
        let newY = currentTop + yOffset * 0.1;

        // Bounce off edges
        if (newX < 0) newX = 0;
        if (newX > maxX) newX = maxX;
        if (newY < minY) newY = minY;
        if (newY > maxY) newY = maxY;

        floatingBonusElement.style.left = newX + 'px';
        floatingBonusElement.style.top = newY + 'px';

        floatingBonusAnimationId = requestAnimationFrame(animate);
    };

    floatingBonusAnimationId = requestAnimationFrame(animate);
}

/**
 * Handle click on floating bonus
 */
function handleFloatingBonusClick(e) {
    e.stopPropagation();

    if (!floatingBonusElement) return;

    const bonusName = floatingBonusElement.dataset.bonusName || 'X Boost';

    // Remove the floating bonus
    removeFloatingBonus();

    // Activate bonus mode!
    activateBonusMode(bonusName);
}

/**
 * Remove floating bonus element
 */
function removeFloatingBonus() {
    // Cancel animation frame
    if (floatingBonusAnimationId) {
        cancelAnimationFrame(floatingBonusAnimationId);
        floatingBonusAnimationId = null;
    }

    if (floatingBonusTimeout) {
        clearTimeout(floatingBonusTimeout);
        floatingBonusTimeout = null;
    }

    if (floatingBonusElement) {
        // Remove event listener before removing element
        floatingBonusElement.removeEventListener('click', handleFloatingBonusClick);
        floatingBonusElement.classList.add('animate-fade-out');
        const elementToRemove = floatingBonusElement;
        floatingBonusElement = null; // Clear reference immediately to stop animation
        setTimeout(() => {
            elementToRemove.remove();
        }, 300);
    }
}

/**
 * Activate the 5x bonus mode for 2 minutes
 */
function activateBonusMode(bonusName) {
    // Set end time
    bonusModeEndTime = Date.now() + BONUS_MODE_DURATION;

    // Play epic sound
    playSound('premium');
    playSound('viral');

    // Big visual effects
    screenFlash('blue');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles('confetti', centerX, centerY, 100);

    // Show bonus mode notification
    showBonusModeNotification(bonusName);

    // Add visual indicator to body
    document.body.classList.add('bonus-mode-active');

    // Create timer display
    createBonusModeTimer();

    // Update state with 5x multiplier
    updateBonusModeState();

    // Update event ticker
    updateEventTicker('🚀 5x BONUS MODE ACTIVE! 🚀');
}

/**
 * Show bonus mode notification
 */
function showBonusModeNotification(bonusName) {
    const notification = document.createElement('div');
    notification.className = 'bonus-mode-notification animate-slide-in-top';
    notification.innerHTML = `
        <div class="bonus-mode-notification-icon">🎉</div>
        <div class="bonus-mode-notification-content">
            <div class="bonus-mode-notification-title">${bonusName} ACTIVATED!</div>
            <div class="bonus-mode-notification-desc">5x TYPING BONUS FOR 2 MINUTES!</div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Create the bonus mode timer display
 */
function createBonusModeTimer() {
    // Remove any existing timer
    const existingTimer = document.getElementById('bonus-mode-timer');
    if (existingTimer) existingTimer.remove();

    const timer = document.createElement('div');
    timer.id = 'bonus-mode-timer';
    timer.innerHTML = `
        <div class="timer-content">
            <span class="timer-icon">⚡</span>
            <span class="timer-label">5x BONUS</span>
            <span class="timer-value">2:00</span>
        </div>
    `;

    document.body.appendChild(timer);

    // Update timer every second
    bonusModeTimerInterval = setInterval(updateBonusModeTimer, 1000);
    updateBonusModeTimer();
}

/**
 * Update the bonus mode timer display
 */
function updateBonusModeTimer() {
    const timer = document.getElementById('bonus-mode-timer');
    if (!timer) return;

    const remaining = Math.max(0, bonusModeEndTime - Date.now());

    if (remaining <= 0) {
        endBonusMode();
        return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const timerValue = timer.querySelector('.timer-value');
    if (timerValue) {
        timerValue.textContent = timeStr;
    }

    // Add urgency styling when time is running low
    if (remaining < 30000) {
        timer.classList.add('urgent');
    }
}

/**
 * Update state with bonus mode multiplier
 */
function updateBonusModeState() {
    const isActive = bonusModeEndTime > Date.now();

    // The bonus mode gives 5x to all coin earnings
    State.updateState({
        bonusModeActive: isActive,
        bonusModeMultiplier: isActive ? 5 : 1
    }, true);

    // Recalculate derived values if needed
    State.recalculateDerived();
}

/**
 * End bonus mode
 */
function endBonusMode() {
    bonusModeEndTime = 0;

    // Clear timer
    if (bonusModeTimerInterval) {
        clearInterval(bonusModeTimerInterval);
        bonusModeTimerInterval = null;
    }

    // Remove timer display
    const timer = document.getElementById('bonus-mode-timer');
    if (timer) {
        timer.classList.add('animate-fade-out');
        setTimeout(() => timer.remove(), 300);
    }

    // Remove body class
    document.body.classList.remove('bonus-mode-active');

    // Update state
    updateBonusModeState();

    // Notify player
    updateEventTicker('Bonus mode ended! Keep typing for more bonuses!');
    playSound('complete');
}

/**
 * Check if bonus mode is active
 */
export function isBonusModeActive() {
    return bonusModeEndTime > Date.now();
}

/**
 * Get current bonus multiplier
 */
export function getBonusMultiplier() {
    return isBonusModeActive() ? 5 : 1;
}

// Expose for debugging
window.IdleTyperEvents = {
    triggerEvent,
    getActiveEvents,
    EVENTS,
    spawnFloatingBonus,
    isBonusModeActive,
    getBonusMultiplier
};
