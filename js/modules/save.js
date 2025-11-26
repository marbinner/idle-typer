/**
 * Save Module
 * Handles localStorage persistence and export/import
 */

import * as State from '../state.js';
import { getPostHistory, loadPostHistory, getBalloonState, loadBalloonState, getTypingState, loadTypingState } from './typing.js';
import { getStatsHistory, loadStatsHistory } from './stats.js';

const SAVE_KEY = 'idleTyper_save';
const SAVE_VERSION = 2; // Bumped for post history support

// Store loaded data to apply after typing init
let pendingPostHistory = null;
let pendingBalloonState = null;
let pendingTypingState = null;
let pendingStatsHistory = null;

/**
 * Initialize save system and load existing save
 */
export function initSave() {
    const saveData = loadFromStorage();

    if (saveData) {
        State.loadState(saveData.state);
        // Store post history and balloon state to load after typing is initialized
        if (saveData.postHistory) {
            pendingPostHistory = saveData.postHistory;
        }
        if (saveData.balloonState) {
            pendingBalloonState = saveData.balloonState;
        }
        if (saveData.typingState) {
            pendingTypingState = saveData.typingState;
        }
        if (saveData.statsHistory) {
            pendingStatsHistory = saveData.statsHistory;
        }
        console.log('Game loaded from save');
    } else {
        console.log('No save found, starting fresh');
    }
}

/**
 * Load post history, balloon state, and typing state (call after typing module is initialized)
 * Returns true if there was a saved typing state to restore
 */
export function loadSavedPostHistory() {
    if (pendingPostHistory) {
        loadPostHistory(pendingPostHistory);
        pendingPostHistory = null;
    }
    // Always call loadBalloonState - it handles null/missing state
    loadBalloonState(pendingBalloonState);
    pendingBalloonState = null;

    // Load typing state if available (restored post)
    const hadTypingState = pendingTypingState !== null;
    if (hadTypingState) {
        loadTypingState(pendingTypingState);
    }
    pendingTypingState = null;

    // Load stats history
    if (pendingStatsHistory) {
        loadStatsHistory(pendingStatsHistory);
    }
    pendingStatsHistory = null;

    return hadTypingState;
}

/**
 * Save game to localStorage
 */
export function save() {
    try {
        const state = State.getStateForSave();
        const postHistory = getPostHistory();
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

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
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
    if (save()) {
        console.log('Auto-saved');
    }
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
        if (!savedString) return null;

        const saveData = JSON.parse(savedString);

        // Version migration if needed
        if (saveData.version !== SAVE_VERSION) {
            return migrateData(saveData);
        }

        return saveData; // Return full save data object
    } catch (error) {
        console.error('Failed to load save:', error);
        return null;
    }
}

/**
 * Migrate old save data to current version
 */
function migrateData(saveData) {
    // Handle version migrations here
    console.log(`Migrating save from v${saveData.version} to v${SAVE_VERSION}`);

    // Migration from v1 to v2: add empty postHistory
    if (saveData.version === 1) {
        return {
            state: saveData.state,
            postHistory: []
        };
    }

    // For now, just return the data as-is
    return saveData;
}

/**
 * Export save as Base64 string
 */
export function exportSave() {
    try {
        const state = State.getStateForSave();
        const postHistory = getPostHistory();
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

        const jsonString = JSON.stringify(saveData);
        return btoa(unescape(encodeURIComponent(jsonString))); // Handle unicode
    } catch (error) {
        console.error('Failed to export save:', error);
        return null;
    }
}

/**
 * Export save and copy to clipboard
 */
export function exportToClipboard() {
    const exportCode = exportSave();
    if (exportCode) {
        navigator.clipboard.writeText(exportCode).then(() => {
            showSaveNotification('Save copied to clipboard!');
        }).catch(() => {
            // Fallback: show in prompt
            prompt('Copy this save code:', exportCode);
        });
        return true;
    }
    return false;
}

/**
 * Export save as downloadable file
 */
export function exportToFile() {
    const exportCode = exportSave();
    if (exportCode) {
        const blob = new Blob([exportCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idle-typer-save-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSaveNotification('Save file downloaded!');
        return true;
    }
    return false;
}

/**
 * Import save from Base64 string
 */
export function importSave(code) {
    try {
        const jsonString = decodeURIComponent(escape(atob(code))); // Handle unicode
        const saveData = JSON.parse(jsonString);

        // Validate save data
        if (!saveData.state || typeof saveData.state !== 'object') {
            throw new Error('Invalid save data');
        }

        // Version migration if needed
        let migratedData = saveData;
        if (saveData.version !== SAVE_VERSION) {
            migratedData = migrateData(saveData);
        }

        // Save to localStorage
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state: migratedData.state || saveData.state,
            postHistory: migratedData.postHistory || saveData.postHistory || [],
            balloonState: migratedData.balloonState || saveData.balloonState || null,
            typingState: migratedData.typingState || saveData.typingState || null,
            statsHistory: migratedData.statsHistory || saveData.statsHistory || null
        }));

        showSaveNotification('Save imported! Refresh to apply.');
        return true;
    } catch (error) {
        console.error('Failed to import save:', error);
        showSaveNotification('Import failed! Invalid save code.');
        return false;
    }
}

/**
 * Reset game (clear save)
 */
export function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    State.resetState(false);
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
