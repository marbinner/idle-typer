/**
 * UI Module
 * Handles DOM updates and number formatting
 */

import * as State from '../state.js';
import { formatNumber, formatFull, formatCoins as formatCoinsUtil, escapeHtml } from '../utils.js';
import { setResetting } from '../state.js';
import { getPostHistory, loadNewPost } from './typing.js';
import { BOTS } from '../data/upgrades.js';

// DOM Elements cache
let followersCountEl;
let followerMultEl;
let bigCoinValueEl;
let bigCpsValueEl;
let bigCoinIconEl;
let botArmyGridEl;
let totalBotsCountEl;
let botArmyCpsValueEl;

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
    bigCoinIconEl = document.getElementById('big-coin-icon');
    botArmyGridEl = document.getElementById('bot-army-grid');
    totalBotsCountEl = document.getElementById('total-bots-count');
    botArmyCpsValueEl = document.getElementById('bot-army-cps-value');

    // Set up event listeners
    setupEventListeners();

    // Initialize PFP selector
    initPFPSelector();

    // Initial render
    updateUI();

    console.log('UI system initialized');
}

// Track event handlers for cleanup
let coinsGainedHandler = null;
let followersGainedHandler = null;

// Track modal overlay handler for cleanup (prevent accumulation)
let currentOverlayHandler = null;

// Track if PFP selector has been initialized
let pfpSelectorInitialized = false;

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
            import('./achievements.js')
                .then(module => {
                    module.showAchievementsModal();
                })
                .catch(err => {
                    console.error('Failed to load achievements module:', err);
                });
        });
    }

    // Remove old listeners if they exist (prevent accumulation on re-init)
    if (coinsGainedHandler) {
        window.removeEventListener('coins-gained', coinsGainedHandler);
    }
    if (followersGainedHandler) {
        window.removeEventListener('followers-gained', followersGainedHandler);
    }

    // Listen for coin gain events for number bump animation
    coinsGainedHandler = (e) => {
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
    };
    window.addEventListener('coins-gained', coinsGainedHandler);

    // View All Posts button
    const viewAllPostsBtn = document.getElementById('view-all-posts-btn');
    if (viewAllPostsBtn) {
        viewAllPostsBtn.addEventListener('click', showAllPostsModal);
    }

    // Listen for follower gain events
    followersGainedHandler = (e) => {
        if (followersCountEl) {
            followersCountEl.classList.add('animate-number-bump');
            setTimeout(() => {
                followersCountEl.classList.remove('animate-number-bump');
            }, 300);
        }
        // Update follower multiplier display
        updateUI();
    };
    window.addEventListener('followers-gained', followersGainedHandler);
}

// Throttle counter for UI updates
let uiUpdateCounter = 0;
const UI_UPDATE_INTERVAL = 3; // Only update every 3 frames (~20fps)

/**
 * Update all UI elements (throttled for performance)
 */
export function updateUI() {
    // Throttle UI updates - don't need 60fps for numbers
    uiUpdateCounter++;
    if (uiUpdateCounter < UI_UPDATE_INTERVAL) return;
    uiUpdateCounter = 0;

    const state = State.getState();

    // Smooth number transitions
    displayedCoins = lerp(displayedCoins, state.coins, 0.15);
    displayedFollowers = lerp(displayedFollowers, state.followers, 0.1);

    const currentCoins = Math.floor(displayedCoins);

    // Update BIG coin display (center) with dynamic unit
    if (bigCoinValueEl) {
        const formatted = formatCoinsUtil(currentCoins);
        bigCoinValueEl.textContent = formatted.value;

        // Update the unit icon dynamically (μ₿ under 1M, ₿ at 1M+)
        if (bigCoinIconEl && bigCoinIconEl.textContent !== formatted.unit) {
            bigCoinIconEl.textContent = formatted.unit;
        }

        // Add bump animation when coins increase significantly
        if (currentCoins > lastCoinValue + 5) {
            bigCoinValueEl.classList.add('bump');
            setTimeout(() => bigCoinValueEl.classList.remove('bump'), 150);
        }
        lastCoinValue = currentCoins;
    }

    // Update big CPS display with dynamic unit based on current coin scale
    if (bigCpsValueEl) {
        const cps = state.coinsPerSecond || 0;
        const cpsContainer = document.getElementById('coin-per-sec');

        if (cps > 0) {
            const formatted = formatCoinsUtil(cps);
            bigCpsValueEl.textContent = `+${formatted.value}`;
            // Add earning glow effect when passively earning
            if (cpsContainer) cpsContainer.classList.add('earning');
        } else {
            bigCpsValueEl.textContent = '+0';
            // Remove earning glow when not earning
            if (cpsContainer) cpsContainer.classList.remove('earning');
        }
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

    // Update bot army display
    updateBotArmyDisplay(state);
}

/**
 * Update bot army visual display
 */
let lastBotCount = -1;
function updateBotArmyDisplay(state) {
    if (!botArmyGridEl) return;

    // Count total bots
    const totalBots = Object.values(state.bots || {}).reduce((sum, count) => sum + count, 0);

    // Update total count
    if (totalBotsCountEl) {
        totalBotsCountEl.textContent = totalBots;
    }

    // Update CPS display
    if (botArmyCpsValueEl) {
        const cps = state.coinsPerSecond || 0;
        if (cps > 0) {
            const formatted = formatCoinsUtil(cps);
            botArmyCpsValueEl.textContent = `+${formatted.full}/sec`;
        } else {
            botArmyCpsValueEl.textContent = '+0/sec';
        }
    }

    // Only rebuild grid if bot count changed
    if (totalBots === lastBotCount) return;
    lastBotCount = totalBots;

    // Clear existing icons
    botArmyGridEl.innerHTML = '';

    if (totalBots === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'bot-army-empty';
        emptyEl.textContent = 'Buy bots to start earning!';
        botArmyGridEl.appendChild(emptyEl);
        return;
    }

    // Get all owned bot types with counts
    const ownedBots = [];
    Object.entries(state.bots || {}).forEach(([botId, count]) => {
        if (count > 0 && BOTS[botId]) {
            ownedBots.push({
                id: botId,
                icon: BOTS[botId].icon,
                name: BOTS[botId].name,
                count: count
            });
        }
    });

    // Create bot entries with emoji + count format
    ownedBots.forEach((bot, index) => {
        const entryEl = document.createElement('div');
        entryEl.className = 'bot-army-entry';
        entryEl.title = `${bot.name} x${bot.count}`;
        entryEl.style.animationDelay = `${(index * 0.1) % 1.5}s`;

        const iconEl = document.createElement('span');
        iconEl.className = 'bot-army-icon';
        iconEl.textContent = bot.icon;

        const countEl = document.createElement('span');
        countEl.className = 'bot-army-count';
        countEl.textContent = `x${bot.count}`;

        entryEl.appendChild(iconEl);
        entryEl.appendChild(countEl);
        botArmyGridEl.appendChild(entryEl);
    });
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
                <label>Skip Current Text</label>
                <button id="skip-post-btn" class="btn btn-secondary">⏭️ Skip Post</button>
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

    // Remove any existing overlay handler to prevent accumulation
    if (currentOverlayHandler) {
        overlay.removeEventListener('click', currentOverlayHandler);
    }

    // Helper to close and cleanup
    const closeModal = () => {
        overlay.classList.add('hidden');
        if (currentOverlayHandler) {
            overlay.removeEventListener('click', currentOverlayHandler);
            currentOverlayHandler = null;
        }
    };

    // Handler for overlay click (close on background click)
    currentOverlayHandler = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    // Set up modal event listeners
    document.getElementById('close-modal')?.addEventListener('click', closeModal);

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

    // Skip post button
    document.getElementById('skip-post-btn')?.addEventListener('click', () => {
        loadNewPost();
        closeModal();
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
                // Use file.text() if available, otherwise fall back to FileReader for older browsers
                const text = await (file.text ? file.text() : new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsText(file);
                }));
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

    document.getElementById('reset-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete ALL progress!')) {
            // Set flag to prevent autosave on unload
            setResetting(true);
            // Clear all storage and force hard reload
            localStorage.clear();
            sessionStorage.clear();
            // Force reload bypassing cache
            window.location.href = window.location.pathname + '?reset=' + Date.now();
        }
    });

    // Close on overlay click (using tracked handler)
    overlay.addEventListener('click', currentOverlayHandler);
}

/**
 * Show all posts modal
 */
function showAllPostsModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    const postHistory = getPostHistory();
    const savedPFP = localStorage.getItem('playerPFP') || '🤡';

    // Format time ago helper
    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
        return Math.floor(seconds / 86400) + 'd';
    };

    // Format engagement number
    const formatEngagement = (num) => {
        if (num < 1000) return num.toString();
        if (num < 10000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num / 1000) + 'K';
    };

    let postsHtml = '';
    if (postHistory.length === 0) {
        postsHtml = '<div class="history-empty" style="padding: 40px; text-align: center;">No posts yet! Start typing to create posts.</div>';
    } else {
        postsHtml = postHistory.map((entry, index) => {
            const e = entry.engagement || { views: 0, likes: 0, retweets: 0, comments: 0 };
            const timeAgo = getTimeAgo(entry.timestamp);

            let badges = '';
            if (entry.isViral) badges += '<span class="viral-badge" style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px;">🔥 VIRAL</span>';
            if (entry.accuracy === 100) badges += '<span class="accuracy-badge" style="font-size: 14px;">💯</span>';

            return `
                <div class="all-posts-item" style="padding: 16px; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--x-blue), var(--premium-purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">${savedPFP}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                                <span style="font-weight: 700;">You</span>
                                <span style="color: var(--text-secondary);">@player · ${timeAgo}</span>
                            </div>
                            ${badges ? `<div style="margin-bottom: 4px;">${badges}</div>` : ''}
                            <div style="margin-bottom: 8px; word-wrap: break-word;">${escapeHtml(entry.text)}</div>
                            <div style="display: flex; gap: 24px; color: var(--text-secondary); font-size: 13px;">
                                <span>💬 ${formatEngagement(e.comments)}</span>
                                <span style="color: #00ba7c;">🔄 ${formatEngagement(e.retweets)}</span>
                                <span style="color: #f91880;">❤️ ${formatEngagement(e.likes)}</span>
                                <span>👁️ ${formatEngagement(e.views)}</span>
                            </div>
                            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                                <span>WPM: ${entry.wpm}</span>
                                <span>ACC: ${entry.accuracy}%</span>
                                <span style="color: var(--x-premium-gold);">+${formatCoinsUtil(entry.coins).full}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    content.innerHTML = `
        <h2 class="modal-title">📋 Your Posts</h2>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 0;">
            ${postsHtml}
        </div>
        <div class="modal-footer" style="padding: 16px; border-top: 1px solid var(--border-color); color: var(--text-secondary); font-size: 13px; text-align: center;">
            Showing ${postHistory.length} most recent posts
        </div>
        <div class="modal-actions">
            <button id="close-modal" class="btn btn-primary">Close</button>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Remove any existing overlay handler to prevent accumulation
    if (currentOverlayHandler) {
        overlay.removeEventListener('click', currentOverlayHandler);
    }

    // Helper to close and cleanup
    const closeModal = () => {
        overlay.classList.add('hidden');
        if (currentOverlayHandler) {
            overlay.removeEventListener('click', currentOverlayHandler);
            currentOverlayHandler = null;
        }
    };

    // Handler for overlay click (close on background click)
    currentOverlayHandler = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', currentOverlayHandler);
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
 * Format coins with dynamic unit (μ₿ → ₿ → K₿ etc.)
 * Returns just the full string for simple usage
 */
export function formatCoins(num) {
    return formatCoinsUtil(num).full;
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

// Available profile pictures
const PFP_OPTIONS = [
    '🤡', '😎', '🤓', '😈', '👻',
    '🦊', '🐸', '🐵', '🦁', '🐺',
    '🤖', '👽', '💀', '🎭', '🥷',
    '🧙', '🧛', '🧟', '🦸', '🦹'
];

/**
 * Initialize PFP selector
 */
export function initPFPSelector() {
    const avatar = document.getElementById('player-avatar');
    if (!avatar) return;

    // Load saved PFP
    const savedPFP = localStorage.getItem('playerPFP') || '🤡';
    avatar.textContent = savedPFP;

    // Prevent adding duplicate event listeners
    if (pfpSelectorInitialized) return;
    pfpSelectorInitialized = true;

    let pfpModal = null;

    avatar.addEventListener('click', (e) => {
        e.stopPropagation();

        // Toggle modal
        if (pfpModal) {
            pfpModal.remove();
            pfpModal = null;
            return;
        }

        // Create modal
        pfpModal = document.createElement('div');
        pfpModal.className = 'pfp-modal';

        // Position modal based on avatar location
        const rect = avatar.getBoundingClientRect();
        pfpModal.style.position = 'fixed';
        pfpModal.style.top = (rect.bottom + 8) + 'px';
        pfpModal.style.left = rect.left + 'px';

        PFP_OPTIONS.forEach(emoji => {
            const option = document.createElement('div');
            option.className = 'pfp-option';
            if (emoji === avatar.textContent) {
                option.classList.add('selected');
            }
            option.textContent = emoji;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                avatar.textContent = emoji;
                localStorage.setItem('playerPFP', emoji);

                // Update all tweet avatars in history
                document.querySelectorAll('.tweet-avatar').forEach(el => {
                    el.textContent = emoji;
                });

                pfpModal.remove();
                pfpModal = null;
            });
            pfpModal.appendChild(option);
        });

        document.body.appendChild(pfpModal);

        // Close on outside click
        const closeHandler = (e) => {
            if (pfpModal && !pfpModal.contains(e.target) && e.target !== avatar) {
                pfpModal.remove();
                pfpModal = null;
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    });
}

export { showToast, formatNumber };
