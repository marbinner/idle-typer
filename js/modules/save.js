/**
 * Save Module
 * Handles localStorage persistence and export/import
 */

import * as State from '../state.js';
import { getResetting } from '../state.js';
import { getPostHistory, loadPostHistory, getBalloonState, loadBalloonState, getTypingState, loadTypingState } from './typing.js';
import { getStatsHistory, loadStatsHistory } from './stats.js';
import { BOTS } from '../data/upgrades.js';

const SAVE_KEY = 'idleTyper_save';
const SAVE_VERSION = 4; // Bumped for Cookie Clicker style rebalance
const MAX_HISTORY_POSTS = 6; // Max posts to keep in history

// Store loaded data to apply after typing init
let pendingPostHistory = null;
let pendingBalloonState = null;
let pendingTypingState = null;
let pendingStatsHistory = null;

/**
 * Initialize save system and load existing save
 */
export function initSave() {
    console.log('Initializing save system...');

    // Check if localStorage is available
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
    } catch (e) {
        console.error('localStorage not available:', e);
        showSaveNotification('Warning: Saving disabled (storage not available)');
        return;
    }

    const saveData = loadFromStorage();

    if (saveData) {
        // Load state
        try {
            State.loadState(saveData.state);
        } catch (stateError) {
            console.error('Failed to load state:', stateError);
            showSaveNotification('Warning: Failed to load some game data');
        }

        // Store post history and balloon state to load after typing is initialized
        pendingPostHistory = saveData.postHistory || null;
        pendingBalloonState = saveData.balloonState || null;
        pendingTypingState = saveData.typingState || null;
        pendingStatsHistory = saveData.statsHistory || null;

        console.log('Game loaded from save');
    } else {
        console.log('No save found, starting fresh');
        // Explicitly clear pending data when no save exists
        pendingPostHistory = null;
        pendingBalloonState = null;
        pendingTypingState = null;
        pendingStatsHistory = null;
    }
}

/**
 * Load post history, balloon state, and typing state (call after typing module is initialized)
 * Returns true if there was a saved typing state to restore
 */
export function loadSavedPostHistory() {
    // Load post history (always call to ensure panel is rendered)
    try {
        loadPostHistory(pendingPostHistory || []);
    } catch (e) {
        console.error('Failed to load post history:', e);
    }
    pendingPostHistory = null;

    // Load balloon state (handles null/missing state internally)
    try {
        loadBalloonState(pendingBalloonState);
    } catch (e) {
        console.error('Failed to load balloon state:', e);
    }
    pendingBalloonState = null;

    // Load typing state if available (restored post)
    let hadTypingState = false;
    if (pendingTypingState) {
        try {
            loadTypingState(pendingTypingState);
            hadTypingState = true;
        } catch (e) {
            console.error('Failed to load typing state:', e);
        }
    }
    pendingTypingState = null;

    // Load stats history
    if (pendingStatsHistory) {
        try {
            loadStatsHistory(pendingStatsHistory);
        } catch (e) {
            console.error('Failed to load stats history:', e);
        }
    }
    pendingStatsHistory = null;

    return hadTypingState;
}

/**
 * Save game to localStorage
 */
export function save() {
    // Don't save if we're in the middle of resetting
    if (getResetting()) {
        console.log('Skipping save - reset in progress');
        return false;
    }
    try {
        const state = State.getStateForSave();
        if (!state) {
            console.error('Save failed: getStateForSave returned null/undefined');
            return false;
        }

        const postHistory = (getPostHistory() || []).slice(-MAX_HISTORY_POSTS);
        const balloonState = getBalloonState();
        const typingState = getTypingState();
        const statsHistory = getStatsHistory();

        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state,
            postHistory,
            balloonState,
            typingState,
            statsHistory
        };

        // Validate save data can be serialized
        let jsonString;
        try {
            jsonString = JSON.stringify(saveData);
        } catch (serializeError) {
            console.error('Save failed: Could not serialize data', serializeError);
            return false;
        }

        try {
            localStorage.setItem(SAVE_KEY, jsonString);

            // Verify the save was written correctly
            const verification = localStorage.getItem(SAVE_KEY);
            if (!verification) {
                console.error('Save verification failed: Data not found after write');
                return false;
            }
            const verifyData = JSON.parse(verification);
            if (verifyData.state.coins !== state.coins) {
                console.warn('Save verification: coins mismatch', {
                    saved: verifyData.state.coins,
                    current: state.coins
                });
            }

        } catch (storageError) {
            // Handle storage quota exceeded or other storage errors
            if (storageError.name === 'QuotaExceededError' ||
                storageError.code === 22 || // Legacy quota error code
                storageError.code === 1014) { // Firefox quota error
                console.error('Save failed: Storage quota exceeded');
                showSaveNotification('Save failed: Storage full!');
                return false;
            }
            throw storageError; // Re-throw other errors
        }
        State.updateState({ lastSaveTime: Date.now() }, true);

        return true;
    } catch (error) {
        console.error('Failed to save:', error);
        return false;
    }
}

/**
 * Auto-save (called periodically)
 */
export function autoSave() {
    save();
}

/**
 * Manual save with feedback
 */
export function manualSave() {
    if (save()) {
        showSaveNotification('Game saved!');
    } else {
        showSaveNotification('Save failed!');
    }
}

/**
 * Load game from localStorage
 */
function loadFromStorage() {
    try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (!savedString) {
            return null;
        }

        let saveData;
        try {
            saveData = JSON.parse(savedString);
        } catch (parseError) {
            console.error('Failed to parse save data:', parseError);
            // Corrupted save - back it up and return null
            try {
                localStorage.setItem(SAVE_KEY + '_backup_corrupted', savedString);
                localStorage.removeItem(SAVE_KEY);
            } catch (e) {
                // Ignore backup errors
            }
            return null;
        }

        // Validate save data structure
        if (!saveData || typeof saveData !== 'object') {
            console.error('Invalid save data structure');
            return null;
        }

        if (!saveData.state || typeof saveData.state !== 'object') {
            console.error('Save data missing state object');
            return null;
        }

        // Version migration if needed
        if (saveData.version !== SAVE_VERSION) {
            console.log('Migrating save from version', saveData.version, 'to', SAVE_VERSION);
            return migrateData(saveData);
        }

        return saveData;
    } catch (error) {
        console.error('Failed to load save:', error);
        return null;
    }
}

/**
 * Migrate old save data to current version
 */
function migrateData(saveData) {
    let state = saveData.state || {};
    let result = { ...saveData };

    // Migration from v1 to v2: add empty postHistory
    if (saveData.version === 1 || !saveData.postHistory) {
        result.postHistory = [];
    }

    // Migration to v3: add new bots
    if (saveData.version < 3 && state.bots) {
        const newBotsV3 = ['lurker', 'memeLord', 'cryptoBro', 'thoughtLeader'];
        newBotsV3.forEach(botId => {
            if (state.bots[botId] === undefined) {
                state.bots[botId] = 0;
            }
        });
        result.state = state;
    }

    // Migration to v4: Cookie Clicker rebalance - preserve all valid bots from current game
    if (saveData.version < 4 && state.bots) {
        // Get valid bots dynamically from current game definition (not hardcoded)
        // This ensures new bots added to the game aren't lost during migration
        const validBots = Object.keys(BOTS);

        // Create new bots object, preserving any saved counts for valid bots
        const newBots = {};
        validBots.forEach(botId => {
            newBots[botId] = state.bots[botId] || 0;
        });
        state.bots = newBots;
        result.state = state;
    }

    result.version = SAVE_VERSION;
    return result;
}

/**
 * Get save data as JSON object
 */
function getSaveData() {
    const state = State.getStateForSave();
    const postHistory = getPostHistory();
    const balloonState = getBalloonState();
    const typingState = getTypingState();
    const statsHistory = getStatsHistory();

    return {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        state,
        postHistory: (postHistory || []).slice(-MAX_HISTORY_POSTS), // Only keep last N posts for smaller saves
        balloonState,
        typingState,
        statsHistory
    };
}

/**
 * Export save as JSON string
 */
export function exportSave() {
    try {
        const saveData = getSaveData();
        return JSON.stringify(saveData, null, 2); // Pretty print for readability
    } catch (error) {
        console.error('Failed to export save:', error);
        return null;
    }
}

/**
 * Export save and copy to clipboard
 */
export function exportToClipboard() {
    const json = exportSave();
    if (json) {
        navigator.clipboard.writeText(json).then(() => {
            showSaveNotification('Save JSON copied to clipboard!');
        }).catch(() => {
            // Fallback: download as file
            exportToFile();
        });
        return true;
    }
    return false;
}

/**
 * Export save as downloadable JSON file
 */
export function exportToFile() {
    try {
        console.log('Starting export...');
        const json = exportSave();
        if (!json) {
            console.error('exportSave returned null');
            showSaveNotification('Export failed - no data!');
            return false;
        }
        console.log('Export data length:', json.length);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shitpost-hero-save-${new Date().toISOString().slice(0,10)}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Cleanup after a delay to ensure download starts
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        showSaveNotification('Save file downloaded!');
        console.log('Export complete');
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        showSaveNotification('Export failed: ' + error.message);
        return false;
    }
}

/**
 * Import save from JSON string
 */
export function importSave(jsonString) {
    try {
        // Try to parse as JSON directly
        let saveData;
        try {
            saveData = JSON.parse(jsonString);
        } catch (parseError) {
            // Maybe it's the old Base64 format - try to decode
            try {
                // Decode Base64 to UTF-8 without deprecated escape() function
                const binaryString = atob(jsonString);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decoded = new TextDecoder('utf-8').decode(bytes);
                saveData = JSON.parse(decoded);
            } catch {
                throw new Error('Could not parse save data - not valid JSON or Base64');
            }
        }

        // Validate save data
        if (!saveData.state || typeof saveData.state !== 'object') {
            throw new Error('Invalid save data - missing state object');
        }

        // Version migration if needed
        let migratedData = saveData;
        if (saveData.version !== SAVE_VERSION) {
            migratedData = migrateData(saveData);
        }

        // Save to localStorage
        const dataToSave = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state: migratedData.state || saveData.state,
            postHistory: migratedData.postHistory || saveData.postHistory || [],
            balloonState: migratedData.balloonState || saveData.balloonState || null,
            typingState: migratedData.typingState || saveData.typingState || null,
            statsHistory: migratedData.statsHistory || saveData.statsHistory || null
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
        } catch (storageError) {
            if (storageError.name === 'QuotaExceededError') {
                showSaveNotification('Import failed: Storage full!');
            } else {
                showSaveNotification('Import failed: ' + storageError.message);
            }
            throw storageError;
        }

        showSaveNotification('Save imported! Refreshing...');

        // Auto-refresh to apply the save
        setTimeout(() => {
            window.location.reload();
        }, 1000);

        return true;
    } catch (error) {
        console.error('Failed to import save:', error);
        showSaveNotification('Import failed! ' + error.message);
        return false;
    }
}

/**
 * Reset game (clear save) - reloads page for clean state
 */
export function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    State.resetState(false);
    // Reload page to ensure all modules reset properly
    window.location.reload();
}

/**
 * Show save notification
 */
function showSaveNotification(message) {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
        setTimeout(() => {
            eventText.textContent = '';
        }, 2000);
    }
}

/**
 * Check if save exists
 */
export function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Get save timestamp
 */
export function getSaveTimestamp() {
    try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (!savedString) return null;

        const saveData = JSON.parse(savedString);
        return saveData.timestamp;
    } catch {
        return null;
    }
}
