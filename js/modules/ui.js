/**
 * UI Module
 * Handles DOM updates and number formatting
 */

import * as State from '../state.js';

// DOM Elements cache
let followersCountEl;
let followerMultEl;
let bigCoinValueEl;
let bigCpsValueEl;

// Animation state for smooth number transitions
let displayedCoins = 0;
let displayedFollowers = 0;
let lastCoinValue = 0;

/**
 * Initialize UI system
 */
export function initUI() {
    // Cache DOM elements
    followersCountEl = document.getElementById('followers-count');
    followerMultEl = document.getElementById('follower-mult');
    bigCoinValueEl = document.getElementById('big-coin-value');
    bigCpsValueEl = document.getElementById('big-cps-value');

    // Set up event listeners
    setupEventListeners();

    // Initial render
    updateUI();

    console.log('UI system initialized');
}

/**
 * Set up UI event listeners
 */
function setupEventListeners() {
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const state = State.getState();
            State.updateState({ soundEnabled: !state.soundEnabled });
            soundToggle.textContent = state.soundEnabled ? '🔇' : '🔊';
        });
    }

    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            import('./save.js').then(module => {
                module.manualSave();
            });
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal);
    }

    // Achievements button
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', () => {
            import('./achievements.js').then(module => {
                module.showAchievementsModal();
            });
        });
    }

    // Listen for coin gain events for number bump animation
    window.addEventListener('coins-gained', (e) => {
        if (bigCoinValueEl) {
            const source = e.detail?.source || 'unknown';
            // Use subtle animation for passive income, bigger for active typing
            if (source === 'passive' || source === 'bots') {
                bigCoinValueEl.classList.add('animate-number-tick');
                setTimeout(() => {
                    bigCoinValueEl.classList.remove('animate-number-tick');
                }, 150);
            } else {
                bigCoinValueEl.classList.add('animate-number-bump');
                setTimeout(() => {
                    bigCoinValueEl.classList.remove('animate-number-bump');
                }, 300);
            }
        }
    });

    // Listen for follower gain events
    window.addEventListener('followers-gained', (e) => {
        if (followersCountEl) {
            followersCountEl.classList.add('animate-number-bump');
            setTimeout(() => {
                followersCountEl.classList.remove('animate-number-bump');
            }, 300);
        }
        // Update follower multiplier display
        updateUI();
    });
}

/**
 * Update all UI elements
 */
export function updateUI() {
    const state = State.getState();

    // Smooth number transitions
    displayedCoins = lerp(displayedCoins, state.coins, 0.15);
    displayedFollowers = lerp(displayedFollowers, state.followers, 0.1);

    const currentCoins = Math.floor(displayedCoins);

    // Update BIG coin display (center) - full numbers for "number go up" satisfaction
    if (bigCoinValueEl) {
        bigCoinValueEl.textContent = formatCoins(currentCoins);

        // Add bump animation when coins increase significantly
        if (currentCoins > lastCoinValue + 5) {
            bigCoinValueEl.classList.add('bump');
            setTimeout(() => bigCoinValueEl.classList.remove('bump'), 150);
        }
        lastCoinValue = currentCoins;
    }

    // Update big CPS display
    if (bigCpsValueEl) {
        const cps = state.coinsPerSecond || 0;
        bigCpsValueEl.textContent = cps > 0 ? `+${formatNumber(cps, 1)}` : '+0';
    }

    // Update followers display
    if (followersCountEl) {
        followersCountEl.textContent = formatNumber(Math.floor(displayedFollowers));
    }

    // Update follower multiplier
    if (followerMultEl) {
        const mult = state.followerMultiplier || 1;
        followerMultEl.textContent = `${mult.toFixed(1)}x`;
    }

    // Update verification badge
    updateVerificationBadge(state.verificationTier);
}

/**
 * Update verification badge
 */
function updateVerificationBadge(tier) {
    const badge = document.getElementById('verification-badge');
    if (badge) {
        badge.className = 'verification';
        if (tier) {
            badge.classList.add(tier);
        }
    }
}

/**
 * Show settings modal
 */
function showSettingsModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    const state = State.getState();

    content.innerHTML = `
        <h2 class="modal-title">Settings</h2>
        <div class="modal-body">
            <div class="setting-item">
                <label>Sound Volume</label>
                <input type="range" id="volume-slider" min="0" max="100" value="${state.volume * 100}">
            </div>
            <div class="setting-item">
                <label>Export Save</label>
                <button id="export-btn" class="btn btn-secondary">Copy Save Code</button>
            </div>
            <div class="setting-item">
                <label>Import Save</label>
                <input type="text" id="import-input" placeholder="Paste save code here">
                <button id="import-btn" class="btn btn-secondary">Import</button>
            </div>
            <div class="setting-item danger">
                <label>Reset Game</label>
                <button id="reset-btn" class="btn btn-secondary" style="background: var(--error-red)">Reset All Progress</button>
            </div>
        </div>
        <div class="modal-actions">
            <button id="close-modal" class="btn btn-primary">Close</button>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Set up modal event listeners
    document.getElementById('close-modal')?.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
        State.updateState({ volume: e.target.value / 100 });
    });

    document.getElementById('export-btn')?.addEventListener('click', async () => {
        const { exportSave } = await import('./save.js');
        const code = exportSave();
        navigator.clipboard.writeText(code);
        showToast('Save code copied!');
    });

    document.getElementById('import-btn')?.addEventListener('click', async () => {
        const input = document.getElementById('import-input');
        if (input && input.value) {
            const { importSave } = await import('./save.js');
            if (importSave(input.value)) {
                showToast('Save imported!');
                overlay.classList.add('hidden');
                location.reload();
            } else {
                showToast('Invalid save code!');
            }
        }
    });

    document.getElementById('reset-btn')?.addEventListener('click', async () => {
        if (confirm('Are you sure? This will delete ALL progress!')) {
            // Use save module's reset function
            const { resetSave } = await import('./save.js');
            resetSave();
            // Force reload bypassing cache
            window.location.href = window.location.href.split('?')[0] + '?reset=' + Date.now();
        }
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });
}

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast animate-slide-in-bottom';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-full);
        z-index: 400;
        border: 1px solid var(--border-color);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

/**
 * Format large numbers with abbreviations (for shop, stats, etc.)
 */
export function formatNumber(num, decimals = 1) {
    // Handle small decimals (like 0.2 cps) - show 1 decimal place
    if (num < 1) {
        return num > 0 ? num.toFixed(1) : '0';
    }
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(decimals) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(decimals) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(decimals) + 'B';
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(decimals) + 'T';
    return (num / 1000000000000000).toFixed(decimals) + 'Qa';
}

/**
 * Format coins with full number display (commas) - only abbreviate at very high values
 * This lets players see the "number go up" experience
 * No decimals for cleaner display
 */
export function formatCoins(num) {
    const n = Math.floor(num);
    // Show full numbers up to 10 million for satisfying "number go up"
    if (n < 10000000) {
        return n.toLocaleString('en-US');
    }
    // After 10M, start abbreviating (1 decimal for readability)
    if (n < 1000000000) return (n / 1000000).toFixed(1) + 'M';
    if (n < 1000000000000) return (n / 1000000000).toFixed(1) + 'B';
    if (n < 1000000000000000) return (n / 1000000000000).toFixed(1) + 'T';
    return (n / 1000000000000000).toFixed(1) + 'Qa';
}

/**
 * Linear interpolation for smooth number transitions
 */
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Show event message in the ticker
 */
export function showEventMessage(message, type = 'normal') {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
        eventText.className = type;
    }
}

export { showToast };
