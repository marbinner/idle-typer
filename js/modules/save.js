/**
 * Save Module
 * Handles localStorage persistence and export/import
 */

import * as State from '../state.js';

const SAVE_KEY = 'idleTyper_save';
const SAVE_VERSION = 1;

/**
 * Initialize save system and load existing save
 */
export function initSave() {
    const savedData = loadFromStorage();

    if (savedData) {
        State.loadState(savedData);
        console.log('Game loaded from save');
    } else {
        console.log('No save found, starting fresh');
    }
}

/**
 * Save game to localStorage
 */
export function save() {
    try {
        const state = State.getStateForSave();
        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state
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

        return saveData.state;
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

    // For now, just return the state as-is
    return saveData.state;
}

/**
 * Export save as Base64 string
 */
export function exportSave() {
    try {
        const state = State.getStateForSave();
        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state
        };

        const jsonString = JSON.stringify(saveData);
        return btoa(jsonString);
    } catch (error) {
        console.error('Failed to export save:', error);
        return null;
    }
}

/**
 * Import save from Base64 string
 */
export function importSave(code) {
    try {
        const jsonString = atob(code);
        const saveData = JSON.parse(jsonString);

        // Validate save data
        if (!saveData.state || typeof saveData.state !== 'object') {
            throw new Error('Invalid save data');
        }

        // Version migration if needed
        let state = saveData.state;
        if (saveData.version !== SAVE_VERSION) {
            state = migrateData(saveData);
        }

        // Save to localStorage
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state
        }));

        return true;
    } catch (error) {
        console.error('Failed to import save:', error);
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
