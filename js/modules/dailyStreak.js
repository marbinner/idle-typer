/**
 * Daily Streak Module
 * Tracks consecutive login days and provides multiplier bonuses
 */

import * as State from '../state.js';
import { STREAK_CONFIG } from '../config.js';
import { formatCoins } from '../utils.js';
import { spawnParticles, spawnFloatingNumber } from './particles.js';

// Track popup handler for cleanup
let currentPopupHandler = null;

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as ISO string
 */
function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

/**
 * Get the streak tier for a given streak count
 */
function getStreakTier(streak) {
    const milestones = STREAK_CONFIG.milestones;
    let tier = milestones[0];

    for (const milestone of milestones) {
        if (streak >= milestone.days) {
            tier = milestone;
        } else {
            break;
        }
    }

    return tier;
}

/**
 * Get the next milestone from current streak
 */
function getNextMilestone(streak) {
    for (const milestone of STREAK_CONFIG.milestones) {
        if (streak < milestone.days) {
            return milestone;
        }
    }
    return null; // Already at max
}

/**
 * Calculate and update streak multiplier
 */
function updateStreakMultiplier(streak) {
    const tier = getStreakTier(streak);
    State.updateState({
        streakMultiplier: tier.multiplier
    }, true);
    State.recalculateDerived();
}

/**
 * Initialize daily streak system
 * Called on game load
 */
export function initDailyStreak() {
    const state = State.getState();
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastLogin = state.lastLoginDate;

    // Check streak status
    if (!lastLogin) {
        // First time playing - start streak at 1
        State.updateState({
            lastLoginDate: today,
            loginStreak: 1,
            streakClaimedToday: false
        }, true);
        updateStreakMultiplier(1);

        // Show welcome popup after a brief delay
        setTimeout(() => showStreakPopup(true), 500);

    } else if (lastLogin === today) {
        // Already logged in today - just update multiplier
        updateStreakMultiplier(state.loginStreak);

    } else if (lastLogin === yesterday) {
        // Consecutive day! Increment streak
        const newStreak = state.loginStreak + 1;
        const oldTier = getStreakTier(state.loginStreak);
        const newTier = getStreakTier(newStreak);
        const reachedNewMilestone = newTier.days > oldTier.days;

        State.updateState({
            lastLoginDate: today,
            loginStreak: newStreak,
            streakClaimedToday: false
        }, true);
        updateStreakMultiplier(newStreak);

        // Show streak popup
        setTimeout(() => showStreakPopup(false, reachedNewMilestone), 500);

    } else {
        // Streak broken - reset to 1
        State.updateState({
            lastLoginDate: today,
            loginStreak: 1,
            streakClaimedToday: false
        }, true);
        updateStreakMultiplier(1);

        // Show streak broken message
        setTimeout(() => showStreakBrokenPopup(state.loginStreak), 500);
    }

    console.log('Daily streak system ready');
}

/**
 * Show the daily streak popup
 */
function showStreakPopup(isFirstTime = false, reachedMilestone = false) {
    const state = State.getState();
    const streak = state.loginStreak;
    const tier = getStreakTier(streak);
    const nextMilestone = getNextMilestone(streak);

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    // Calculate bonus reward
    const bonusCps = state.coinsPerSecond || 0;
    const bonusCoins = Math.max(
        STREAK_CONFIG.milestoneBonus.minCoins,
        Math.floor(bonusCps * STREAK_CONFIG.milestoneBonus.cpsSeconds)
    );
    const bonusFollowers = Math.floor(
        state.followers * STREAK_CONFIG.milestoneBonus.followerPercent
    );

    let title = isFirstTime ? 'Welcome!' : `Day ${streak} Streak!`;
    let subtitle = tier.label;

    if (reachedMilestone && streak > 1) {
        title = `NEW MILESTONE!`;
        subtitle = `${tier.label} - Day ${streak}!`;
    }

    // Build progress bar for next milestone
    let progressHtml = '';
    if (nextMilestone) {
        const progress = ((streak - tier.days) / (nextMilestone.days - tier.days)) * 100;
        progressHtml = `
            <div class="streak-progress">
                <div class="streak-progress-label">
                    <span>Next: ${nextMilestone.label}</span>
                    <span>${streak}/${nextMilestone.days} days</span>
                </div>
                <div class="streak-progress-bar">
                    <div class="streak-progress-fill" style="width: ${progress}%; background: ${nextMilestone.color};"></div>
                </div>
                <div class="streak-next-bonus">
                    Next bonus: <span style="color: ${nextMilestone.color}">${nextMilestone.multiplier}x</span> all earnings
                </div>
            </div>
        `;
    } else {
        progressHtml = `
            <div class="streak-progress">
                <div class="streak-max-tier">You've reached the highest tier!</div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="streak-popup">
            <div class="streak-header" style="border-color: ${tier.color};">
                <div class="streak-icon" style="color: ${tier.color};">
                    ${getStreakIcon(streak)}
                </div>
                <h2 class="streak-title" style="color: ${tier.color};">${title}</h2>
                <div class="streak-subtitle">${subtitle}</div>
            </div>

            <div class="streak-multiplier">
                <span class="streak-mult-value" style="color: ${tier.color};">${tier.multiplier}x</span>
                <span class="streak-mult-label">All Earnings</span>
            </div>

            ${progressHtml}

            <div class="streak-bonus">
                <div class="streak-bonus-title">${isFirstTime ? 'Welcome Bonus!' : 'Daily Bonus!'}</div>
                <div class="streak-bonus-rewards">
                    <div class="streak-reward">
                        <span class="streak-reward-icon">$</span>
                        <span class="streak-reward-value">${formatCoins(bonusCoins).full}</span>
                    </div>
                    ${bonusFollowers > 0 ? `
                        <div class="streak-reward">
                            <span class="streak-reward-icon">+</span>
                            <span class="streak-reward-value">${bonusFollowers} followers</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <button class="streak-claim-btn" id="claim-streak-btn" style="background: ${tier.color};">
                Claim Bonus!
            </button>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Clean up previous handler
    if (currentPopupHandler) {
        overlay.removeEventListener('click', currentPopupHandler);
    }

    // Set up claim button
    const claimBtn = document.getElementById('claim-streak-btn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            claimDailyBonus(bonusCoins, bonusFollowers, tier);
            closeStreakPopup();
        });
    }

    // Allow clicking outside to close (but still claim)
    currentPopupHandler = (e) => {
        if (e.target === overlay) {
            claimDailyBonus(bonusCoins, bonusFollowers, tier);
            closeStreakPopup();
        }
    };
    overlay.addEventListener('click', currentPopupHandler);
}

/**
 * Show streak broken popup
 */
function showStreakBrokenPopup(oldStreak) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    content.innerHTML = `
        <div class="streak-popup streak-broken">
            <div class="streak-header" style="border-color: #ff4444;">
                <div class="streak-icon" style="color: #ff4444;">
                    X
                </div>
                <h2 class="streak-title" style="color: #ff4444;">Streak Lost!</h2>
                <div class="streak-subtitle">Your ${oldStreak}-day streak has ended</div>
            </div>

            <div class="streak-broken-message">
                Don't worry! Start a new streak today.
            </div>

            <div class="streak-multiplier">
                <span class="streak-mult-value" style="color: #888;">1x</span>
                <span class="streak-mult-label">Earnings (base)</span>
            </div>

            <button class="streak-claim-btn" id="streak-continue-btn" style="background: #1d9bf0;">
                Let's Go!
            </button>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Clean up previous handler
    if (currentPopupHandler) {
        overlay.removeEventListener('click', currentPopupHandler);
    }

    const continueBtn = document.getElementById('streak-continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', closeStreakPopup);
    }

    currentPopupHandler = (e) => {
        if (e.target === overlay) {
            closeStreakPopup();
        }
    };
    overlay.addEventListener('click', currentPopupHandler);
}

/**
 * Close the streak popup
 */
function closeStreakPopup() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        if (currentPopupHandler) {
            overlay.removeEventListener('click', currentPopupHandler);
            currentPopupHandler = null;
        }
    }
}

/**
 * Claim the daily bonus
 */
function claimDailyBonus(coins, followers, tier) {
    const state = State.getState();

    // Only claim once per day
    if (state.streakClaimedToday) return;

    // Award coins
    if (coins > 0) {
        State.addCoins(coins, 'streak');
    }

    // Award followers
    if (followers > 0) {
        State.addFollowers(followers, 'streak');
    }

    // Mark as claimed
    State.updateState({ streakClaimedToday: true }, true);

    // Spawn celebration particles
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles(centerX, centerY, 30, tier.color);

    // Spawn floating number
    spawnFloatingNumber(`+${formatCoins(coins).full}`, centerX, centerY - 50, 'streak');

    console.log(`Daily bonus claimed: ${coins} coins, ${followers} followers`);
}

/**
 * Get streak icon based on streak count
 */
function getStreakIcon(streak) {
    if (streak >= 100) return '&#x1F525;&#x1F525;&#x1F525;'; // Triple fire
    if (streak >= 60) return '&#x2B50;&#x2B50;'; // Double star
    if (streak >= 30) return '&#x1F31F;'; // Star
    if (streak >= 14) return '&#x1F525;'; // Fire
    if (streak >= 7) return '&#x26A1;'; // Lightning
    if (streak >= 3) return '&#x2728;'; // Sparkles
    return '&#x1F44B;'; // Wave
}

/**
 * Get current streak info (for UI display elsewhere)
 */
export function getStreakInfo() {
    const state = State.getState();
    const streak = state.loginStreak || 0;
    const tier = getStreakTier(streak);
    const nextMilestone = getNextMilestone(streak);

    return {
        streak,
        tier,
        nextMilestone,
        multiplier: tier.multiplier
    };
}
