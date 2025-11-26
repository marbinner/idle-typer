/**
 * Idle Module
 * Handles passive income from bots
 */

import * as State from '../state.js';
import { BOTS } from '../data/upgrades.js';

// Accumulator for fractional values
let coinAccumulator = 0;
let impressionAccumulator = 0;

/**
 * Tick function - called every frame
 * @param {number} deltaTime - Time since last tick in seconds
 */
export function tick(deltaTime) {
    const state = State.getState();

    // Calculate coins gained this tick from bots
    const coinsGained = state.coinsPerSecond * deltaTime;

    // Accumulate fractional coins
    coinAccumulator += coinsGained;

    // Only add whole coins to state
    if (coinAccumulator >= 1) {
        const wholeCoins = Math.floor(coinAccumulator);
        coinAccumulator -= wholeCoins;

        if (wholeCoins > 0) {
            State.addCoins(wholeCoins, 'idle');
        }
    }

    // Calculate impressions (followers generate impressions passively)
    const impressionsGained = state.followers * 0.001 * deltaTime; // 0.1% of followers per second
    impressionAccumulator += impressionsGained;

    if (impressionAccumulator >= 1) {
        const wholeImpressions = Math.floor(impressionAccumulator);
        impressionAccumulator -= wholeImpressions;

        if (wholeImpressions > 0) {
            State.addImpressions(wholeImpressions);
        }
    }
}

/**
 * Calculate coins per second based on owned bots
 */
export function calculateCPS() {
    State.recalculateDerived();
    return State.getValue('coinsPerSecond');
}

/**
 * Get total bot count
 */
export function getTotalBots() {
    const state = State.getState();
    return Object.values(state.bots).reduce((sum, count) => sum + count, 0);
}

/**
 * Get bot contribution breakdown
 */
export function getBotContributions() {
    const state = State.getState();

    const contributions = [];

    Object.entries(state.bots).forEach(([botId, count]) => {
        if (count > 0 && BOTS[botId]) {
            const bot = BOTS[botId];
            contributions.push({
                id: botId,
                name: bot.name,
                count,
                cps: bot.cps * count,
                percentage: 0 // Will be calculated
            });
        }
    });

    // Calculate percentages
    const totalCPS = contributions.reduce((sum, c) => sum + c.cps, 0);
    contributions.forEach(c => {
        c.percentage = totalCPS > 0 ? (c.cps / totalCPS * 100) : 0;
    });

    return contributions;
}

/**
 * Calculate time until target coins
 */
export function timeToTarget(targetCoins) {
    const state = State.getState();
    const remaining = targetCoins - state.coins;

    if (remaining <= 0) return 0;
    if (state.coinsPerSecond <= 0) return Infinity;

    return remaining / state.coinsPerSecond;
}

/**
 * Format time duration
 */
export function formatTime(seconds) {
    if (seconds === Infinity) return 'Never (need bots!)';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
