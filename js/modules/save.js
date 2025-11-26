/**
 * Save Module
 * Handles localStorage persistence and export/import
 */

import * as State from '../state.js';
import { getPostHistory, loadPostHistory, getBalloonState, loadBalloonState, getTypingState, loadTypingState } from './typing.js';
import { getStatsHistory, loadStatsHistory } from './stats.js';

const SAVE_KEY = 'idleTyper_save';
const SAVE_VERSION = 4; // Bumped for Cookie Clicker style rebalance

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
        console.log('Loading save data:', {
            version: saveData.version,
            coins: saveData.state?.coins,
            postHistoryLength: saveData.postHistory?.length || 0,
            hasBalloonState: !!saveData.balloonState,
            hasTypingState: !!saveData.typingState
        });
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
    // Always call loadPostHistory to ensure the panel is rendered (even if empty)
    console.log('loadSavedPostHistory called, pendingPostHistory:', pendingPostHistory?.length || 'null');
    loadPostHistory(pendingPostHistory || []);
    pendingPostHistory = null;
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

    // Migration to v4: Cookie Clicker rebalance - remove old bots, keep valid ones
    if (saveData.version < 4 && state.bots) {
        // Valid bots in v4
        const validBots = [
            'replyGuy', 'lurker', 'burnerAccount', 'shitposter',
            'memeLord', 'contentCreator', 'blueCheck',
            'influencer', 'cryptoBro', 'grokAI',
            'botFarm', 'elonsAlt', 'mediaEmpire',
            'digitalGod', 'realityWarper'
        ];

        // Create new bots object with only valid bots
        const newBots = {};
        validBots.forEach(botId => {
            newBots[botId] = state.bots[botId] || 0;
        });
        state.bots = newBots;
        result.state = state;
        console.log('Migrated bots to v4:', Object.keys(newBots));
    }

    result.version = SAVE_VERSION;
    return result;
}

/**
 * Get save data as JSON object
 */
function getSaveData() {
    console.log('Getting save data...');
    const state = State.getStateForSave();
    console.log('State for save:', state ? 'OK' : 'NULL', 'coins:', state?.coins);

    const postHistory = getPostHistory();
    console.log('Post history:', postHistory?.length || 0, 'posts');

    const balloonState = getBalloonState();
    const typingState = getTypingState();
    const statsHistory = getStatsHistory();

    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        state,
        postHistory: postHistory.slice(-8), // Only keep last 8 posts for smaller saves
        balloonState,
        typingState,
        statsHistory
    };

    console.log('Save data assembled, version:', SAVE_VERSION);
    return saveData;
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
        console.log('Importing save, string length:', jsonString?.length);

        // Try to parse as JSON directly
        let saveData;
        try {
            saveData = JSON.parse(jsonString);
            console.log('Parsed JSON successfully, version:', saveData.version);
        } catch (parseError) {
            console.log('JSON parse failed, trying Base64...', parseError.message);
            // Maybe it's the old Base64 format - try to decode
            try {
                const decoded = decodeURIComponent(escape(atob(jsonString)));
                saveData = JSON.parse(decoded);
            } catch {
                throw new Error('Could not parse save data - not valid JSON or Base64');
            }
        }

        // Validate save data
        if (!saveData.state || typeof saveData.state !== 'object') {
            console.error('Save data structure:', Object.keys(saveData));
            throw new Error('Invalid save data - missing state object');
        }

        console.log('Save data valid, state keys:', Object.keys(saveData.state));

        // Version migration if needed
        let migratedData = saveData;
        if (saveData.version !== SAVE_VERSION) {
            console.log('Migrating from version', saveData.version, 'to', SAVE_VERSION);
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

        localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
        console.log('Saved to localStorage successfully');

        showSaveNotification('Save imported! Refreshing...');

        // Auto-refresh to apply the save
        setTimeout(() => {
            console.log('Reloading page...');
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
