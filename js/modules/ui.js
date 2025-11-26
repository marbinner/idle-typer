/**
 * UI Module
 * Handles DOM updates and number formatting
 */

import * as State from '../state.js';
import { formatNumber, formatFull } from '../utils.js';

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
                <label>Sound</label>
                <div class="toggle-group">
                    <button id="sound-toggle-btn" class="btn btn-secondary ${state.soundEnabled ? 'active' : ''}">
                        ${state.soundEnabled ? '🔊 On' : '🔇 Off'}
                    </button>
                </div>
            </div>
            <div class="setting-item">
                <label>Sound Volume</label>
                <input type="range" id="volume-slider" min="0" max="100" value="${state.volume * 100}">
            </div>
            <div class="setting-item">
                <label>Export Save</label>
                <button id="export-btn" class="btn btn-secondary">💾 Download Save File</button>
            </div>
            <div class="setting-item">
                <label>Import Save</label>
                <input type="file" id="import-file" accept=".json" style="display: none">
                <button id="import-btn" class="btn btn-secondary">📂 Load Save File</button>
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

    // Sound toggle
    document.getElementById('sound-toggle-btn')?.addEventListener('click', (e) => {
        const currentState = State.getState();
        const newSoundEnabled = !currentState.soundEnabled;
        State.updateState({ soundEnabled: newSoundEnabled });
        e.target.textContent = newSoundEnabled ? '🔊 On' : '🔇 Off';
        e.target.classList.toggle('active', newSoundEnabled);
    });

    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
        State.updateState({ volume: e.target.value / 100 });
    });

    // Export - download JSON file
    document.getElementById('export-btn')?.addEventListener('click', async () => {
        try {
            console.log('Export button clicked');
            const saveModule = await import('./save.js');
            console.log('Save module loaded');
            const result = saveModule.exportToFile();
            console.log('Export result:', result);
            if (!result) {
                showToast('Export failed!');
            }
        } catch (err) {
            console.error('Export error:', err);
            showToast('Export failed: ' + err.message);
        }
    });

    // Import - file picker
    const importFileInput = document.getElementById('import-file');
    const importBtn = document.getElementById('import-btn');

    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', () => {
            console.log('Import button clicked, triggering file picker');
            importFileInput.click();
        });

        importFileInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                console.log('No file selected');
                return;
            }

            console.log('Loading save file:', file.name, 'size:', file.size);
            try {
                const text = await file.text();
                console.log('File content read, length:', text.length);
                console.log('First 100 chars:', text.substring(0, 100));

                const saveModule = await import('./save.js');
                console.log('Save module loaded for import');

                const result = saveModule.importSave(text);
                console.log('Import result:', result);

                if (result) {
                    showToast('Save imported! Reloading...');
                    overlay.classList.add('hidden');
                    // importSave already triggers reload
                } else {
                    showToast('Invalid save file!');
                }
            } catch (err) {
                console.error('File read/import error:', err);
                showToast('Failed to import: ' + err.message);
            }

            // Reset the input so the same file can be selected again
            e.target.value = '';
        });
    } else {
        console.error('Import elements not found:', { importBtn, importFileInput });
    }

    document.getElementById('reset-btn')?.addEventListener('click', async () => {
        if (confirm('Are you sure? This will delete ALL progress!')) {
            // Use save module's reset function
            const { resetSave } = await import('./save.js');
            const { clearPostHistory } = await import('./typing.js');
            resetSave();
            clearPostHistory();
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
    // After 10M, use consistent formatting from utils
    return formatNumber(n, 1);
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

export { showToast, formatNumber };
