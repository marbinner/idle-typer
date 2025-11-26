/**
 * Upgrades Module
 * Handles bot purchases, upgrades, and the shop UI
 */

import * as State from '../state.js';
import { BOTS, UPGRADES } from '../data/upgrades.js';
import { playSound } from './sound.js';
import { spawnParticles } from './particles.js';

// DOM Elements
let botsListEl;
let upgradesListEl;
let premiumListEl;

/**
 * Initialize the upgrades system
 */
export function initUpgrades() {
    // Cache DOM elements
    botsListEl = document.getElementById('bots-list');
    upgradesListEl = document.getElementById('upgrades-list');
    premiumListEl = document.getElementById('premium-list');

    // Set up tab switching
    const tabs = document.querySelectorAll('.panel-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Subscribe to state changes for affordability updates
    State.subscribe(() => {
        updateAffordability();
    });

    console.log('Upgrades system initialized');
}

/**
 * Switch between tabs
 */
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.panel-tabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabId}-tab`);
    });
}

/**
 * Render all upgrades
 */
export function renderUpgrades() {
    renderBots();
    renderUpgradesList();
    renderPremium();
}

/**
 * Render bots list
 */
function renderBots() {
    if (!botsListEl) return;

    const state = State.getState();

    // Get all bots as array with unlock info (based on lifetime coins earned)
    const botsArray = Object.entries(BOTS).map(([id, bot]) => ({
        id,
        bot,
        isUnlocked: state.lifetimeCoins >= (bot.unlockAt || 0),
        unlockAt: bot.unlockAt || 0
    }));

    // Find first locked bot index
    const firstLockedIndex = botsArray.findIndex(b => !b.isUnlocked);

    // Show unlocked + next 2 locked (teaser)
    const visibleBots = botsArray.filter((b, i) => {
        if (b.isUnlocked) return true;
        if (firstLockedIndex === -1) return false;
        return i <= firstLockedIndex + 1; // Show next 2 locked
    });

    const botsHtml = visibleBots.map(({ id, bot, isUnlocked }) => {
        const owned = state.bots[id] || 0;
        const cost = calculateBotCost(id, owned);
        const canAfford = state.coins >= cost;

        if (!isUnlocked) {
            // Calculate fade level based on how far away it is (0 = first locked, 1 = second locked, etc.)
            const lockedIndex = botsArray.filter(b => !b.isUnlocked).findIndex(b => b.id === id);
            const fadeLevel = Math.min(lockedIndex, 2); // Max 3 levels of fade

            return `
                <div class="upgrade-item locked fade-${fadeLevel}" data-type="bot" data-id="${id}">
                    <div class="upgrade-icon locked-icon">🔒</div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">???</div>
                        <div class="upgrade-desc">Unlock at ₿${formatNumber(bot.unlockAt)} lifetime</div>
                    </div>
                    <div class="upgrade-cost">
                        <span class="cost-icon">₿</span>
                        <span class="cost-value locked-cost">${formatNumber(bot.unlockAt)}</span>
                    </div>
                </div>
            `;
        }

        const totalCPS = Math.round(bot.cps * owned * 10) / 10; // Round to 1 decimal
        const cpsDisplay = bot.cps >= 1 ? Math.round(bot.cps) : bot.cps.toFixed(1);

        return `
            <div class="upgrade-item ${canAfford ? 'affordable' : ''}"
                 data-type="bot" data-id="${id}">
                <div class="upgrade-icon">${bot.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${bot.name} ${owned > 0 ? `<span class="owned-badge">×${owned}</span>` : ''}</div>
                    <div class="upgrade-desc">${bot.description}</div>
                    ${owned > 0 ? `<div class="current-gen">Generating: <span class="gen-value">+${formatNumber(totalCPS)}/s</span></div>` : ''}
                </div>
                <div class="upgrade-right">
                    <div class="buy-gain">
                        <span class="gain-label">BUY FOR</span>
                        <span class="gain-value">+${cpsDisplay}/s</span>
                    </div>
                    <div class="upgrade-cost ${canAfford ? 'can-afford' : 'cant-afford'}">
                        <span class="cost-icon">₿</span>
                        <span class="cost-value">${formatNumber(cost)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    botsListEl.innerHTML = botsHtml;

    // Add click handlers
    botsListEl.querySelectorAll('.upgrade-item[data-type="bot"]').forEach(item => {
        item.addEventListener('click', () => handleBotPurchase(item.dataset.id));
    });
}

/**
 * Render upgrades list
 */
function renderUpgradesList() {
    if (!upgradesListEl) return;

    const state = State.getState();

    // Get all upgrades as array with unlock info (based on lifetime coins earned)
    const upgradesArray = Object.entries(UPGRADES).map(([id, upgrade]) => ({
        id,
        upgrade,
        isUnlocked: state.lifetimeCoins >= (upgrade.unlockAt || 0),
        unlockAt: upgrade.unlockAt || 0
    }));

    // Find first locked upgrade index
    const firstLockedIndex = upgradesArray.findIndex(u => !u.isUnlocked);

    // Show unlocked + next 2 locked (teaser)
    const visibleUpgrades = upgradesArray.filter((u, i) => {
        if (u.isUnlocked) return true;
        if (firstLockedIndex === -1) return false;
        return i <= firstLockedIndex + 1;
    });

    const upgradesHtml = visibleUpgrades.map(({ id, upgrade, isUnlocked }) => {
        const level = state.upgrades[id] || 0;
        const maxLevel = upgrade.maxLevel || Infinity;
        const isMaxed = level >= maxLevel;
        const cost = isMaxed ? 0 : calculateUpgradeCost(id, level);
        const canAfford = !isMaxed && state.coins >= cost;

        if (!isUnlocked) {
            return `
                <div class="upgrade-item locked" data-type="upgrade" data-id="${id}">
                    <div class="upgrade-icon locked-icon">🔒</div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">???</div>
                        <div class="upgrade-desc">Unlock at ${formatNumber(upgrade.unlockAt)} lifetime coins</div>
                    </div>
                    <div class="upgrade-cost">
                        <span class="cost-value locked-cost">${formatNumber(upgrade.unlockAt)}</span>
                        <span class="cost-label">to unlock</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="upgrade-item ${canAfford ? 'affordable' : ''} ${isMaxed ? 'maxed' : ''}"
                 data-type="upgrade" data-id="${id}">
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-desc">${upgrade.description}</div>
                    <div class="upgrade-stats">${isMaxed ? 'MAXED OUT' : `Level ${level}/${maxLevel}`}</div>
                </div>
                <div class="upgrade-cost ${!isMaxed && canAfford ? 'can-afford' : !isMaxed ? 'cant-afford' : ''}">
                    ${isMaxed ? '<span class="cost-value maxed-text">✓ MAX</span>' : `
                        <span class="cost-icon">₿</span>
                        <span class="cost-value">${formatNumber(cost)}</span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    upgradesListEl.innerHTML = upgradesHtml;

    // Add click handlers
    upgradesListEl.querySelectorAll('.upgrade-item[data-type="upgrade"]').forEach(item => {
        item.addEventListener('click', () => handleUpgradePurchase(item.dataset.id));
    });
}

/**
 * Render premium list
 */
function renderPremium() {
    if (!premiumListEl) return;

    const state = State.getState();

    const premiumItems = [
        {
            id: 'xPremium',
            name: 'X Premium',
            icon: '✓',
            description: 'Get verified and unlock premium features',
            cost: 8000,
            owned: state.hasXPremium,
            effect: () => {
                State.updateState({ hasXPremium: true, verificationTier: 'blue' });
                State.recalculateDerived();
            }
        },
        {
            id: 'goldCheck',
            name: 'Gold Verification',
            icon: '✓',
            description: 'Organization badge - 1.5x all bonuses',
            cost: 100000,
            owned: state.verificationTier === 'gold' || state.verificationTier === 'gray',
            requires: state.hasXPremium,
            effect: () => {
                State.updateState({ verificationTier: 'gold' });
                State.recalculateDerived();
            }
        },
        {
            id: 'grayCheck',
            name: 'Government Badge',
            icon: '✓',
            description: 'Gray check (parody) - 2x all bonuses',
            cost: 1000000,
            owned: state.verificationTier === 'gray',
            requires: state.verificationTier === 'gold',
            effect: () => {
                State.updateState({ verificationTier: 'gray' });
                State.recalculateDerived();
            }
        }
    ];

    const premiumHtml = premiumItems.map(item => {
        const canAfford = state.coins >= item.cost;
        const isLocked = item.requires === false;
        const isOwned = item.owned;

        return `
            <div class="upgrade-item ${canAfford && !isOwned && !isLocked ? 'affordable' : ''} ${isLocked ? 'locked' : ''} ${isOwned ? 'owned' : ''}"
                 data-type="premium" data-id="${item.id}">
                <div class="upgrade-icon" style="color: ${item.id === 'xPremium' ? 'var(--x-premium-blue)' : item.id === 'goldCheck' ? 'var(--x-premium-gold)' : 'var(--x-premium-gray)'}">${item.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${item.name}</div>
                    <div class="upgrade-desc">${item.description}</div>
                </div>
                <div class="upgrade-cost ${!isOwned && canAfford && !isLocked ? 'can-afford' : !isOwned ? 'cant-afford' : ''}">
                    ${isOwned ? '<span class="cost-value" style="color: var(--success-green)">OWNED</span>' : `
                        <span class="cost-icon">₿</span>
                        <span class="cost-value">${formatNumber(item.cost)}</span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    premiumListEl.innerHTML = premiumHtml;

    // Add click handlers
    premiumListEl.querySelectorAll('.upgrade-item[data-type="premium"]').forEach(item => {
        const itemData = premiumItems.find(p => p.id === item.dataset.id);
        if (itemData && !itemData.owned) {
            item.addEventListener('click', () => handlePremiumPurchase(itemData));
        }
    });
}

/**
 * Handle bot purchase
 */
function handleBotPurchase(botId) {
    const state = State.getState();
    const bot = BOTS[botId];
    if (!bot) return;

    const owned = state.bots[botId] || 0;
    const cost = calculateBotCost(botId, owned);
    const isUnlocked = state.lifetimeCoins >= (bot.unlockAt || 0);

    if (!isUnlocked) {
        showMessage(`Unlock at ${formatNumber(bot.unlockAt)} lifetime coins!`);
        return;
    }

    if (State.purchaseBot(botId, cost)) {
        playSound('purchase');

        // Visual feedback
        const item = document.querySelector(`[data-type="bot"][data-id="${botId}"]`);
        if (item) {
            item.classList.add('animate-squish');
            setTimeout(() => item.classList.remove('animate-squish'), 400);

            const rect = item.getBoundingClientRect();
            spawnParticles('purchase', rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
        }

        // Re-render to update counts and costs
        renderBots();
        showMessage(`Hired ${bot.name}!`);
    } else {
        showMessage('Not enough coins!');
        playSound('error');
    }
}

/**
 * Handle upgrade purchase
 */
function handleUpgradePurchase(upgradeId) {
    const state = State.getState();
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return;

    const level = state.upgrades[upgradeId] || 0;
    const maxLevel = upgrade.maxLevel || Infinity;

    if (level >= maxLevel) {
        showMessage('Already maxed!');
        return;
    }

    const cost = calculateUpgradeCost(upgradeId, level);
    const isUnlocked = state.lifetimeCoins >= (upgrade.unlockAt || 0);

    if (!isUnlocked) {
        showMessage(`Unlock at ${formatNumber(upgrade.unlockAt)} lifetime coins!`);
        return;
    }

    if (State.spendCoins(cost)) {
        // Update upgrade level
        const newUpgrades = { ...state.upgrades };
        newUpgrades[upgradeId] = level + 1;
        State.updateState({ upgrades: newUpgrades });

        // Apply upgrade effect
        if (upgrade.effect) {
            upgrade.effect(level + 1);
        }

        State.recalculateDerived();
        playSound('upgrade');

        // Visual feedback
        const item = document.querySelector(`[data-type="upgrade"][data-id="${upgradeId}"]`);
        if (item) {
            item.classList.add('animate-squish');
            setTimeout(() => item.classList.remove('animate-squish'), 400);
        }

        renderUpgradesList();
        showMessage(`${upgrade.name} upgraded!`);
    } else {
        showMessage('Not enough coins!');
        playSound('error');
    }
}

/**
 * Handle premium purchase
 */
function handlePremiumPurchase(item) {
    const state = State.getState();

    if (item.owned) {
        showMessage('Already owned!');
        return;
    }

    if (item.requires === false) {
        showMessage('Requirements not met!');
        return;
    }

    if (State.spendCoins(item.cost)) {
        item.effect();
        playSound('premium');

        // Big celebration
        const panel = document.getElementById('premium-list');
        if (panel) {
            const rect = panel.getBoundingClientRect();
            spawnParticles('confetti', rect.left + rect.width / 2, rect.top, 50);
        }

        renderPremium();
        updateVerificationBadge();
        showMessage(`${item.name} unlocked!`);
    } else {
        showMessage('Not enough coins!');
        playSound('error');
    }
}

/**
 * Update verification badge display
 */
function updateVerificationBadge() {
    const state = State.getState();
    const badge = document.getElementById('verification-badge');
    if (badge) {
        badge.className = 'verification';
        if (state.verificationTier) {
            badge.classList.add(state.verificationTier);
        }
    }
}

/**
 * Calculate bot cost based on owned count
 */
function calculateBotCost(botId, owned) {
    const bot = BOTS[botId];
    if (!bot) return Infinity;

    // Exponential scaling with softcap
    if (owned < 25) {
        return Math.floor(bot.baseCost * Math.pow(bot.costMult || 1.15, owned));
    } else {
        const softcapCost = bot.baseCost * Math.pow(bot.costMult || 1.15, 25);
        const extra = owned - 25;
        return Math.floor(softcapCost * Math.pow(1.05, extra));
    }
}

/**
 * Calculate upgrade cost based on level
 */
function calculateUpgradeCost(upgradeId, level) {
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return Infinity;

    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult || 1.5, level));
}

/**
 * Update affordability classes and tab indicators
 */
function updateAffordability() {
    const state = State.getState();

    let hasAffordableBot = false;
    let hasAffordableUpgrade = false;
    let hasAffordablePremium = false;

    // Update bots
    document.querySelectorAll('[data-type="bot"]').forEach(item => {
        const botId = item.dataset.id;
        const bot = BOTS[botId];
        if (!bot) return;

        const owned = state.bots[botId] || 0;
        const cost = calculateBotCost(botId, owned);
        const isUnlocked = state.lifetimeCoins >= (bot.unlockAt || 0);
        const canAfford = isUnlocked && state.coins >= cost;

        item.classList.toggle('affordable', canAfford);
        if (canAfford) hasAffordableBot = true;
    });

    // Update upgrades
    document.querySelectorAll('[data-type="upgrade"]').forEach(item => {
        const upgradeId = item.dataset.id;
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade) return;

        const level = state.upgrades[upgradeId] || 0;
        const maxLevel = upgrade.maxLevel || Infinity;
        const isMaxed = level >= maxLevel;
        const cost = calculateUpgradeCost(upgradeId, level);
        const isUnlocked = state.lifetimeCoins >= (upgrade.unlockAt || 0);
        const canAfford = isUnlocked && !isMaxed && state.coins >= cost;

        item.classList.toggle('affordable', canAfford);
        if (canAfford) hasAffordableUpgrade = true;
    });

    // Check premium affordability
    const premiumItems = [
        { id: 'xPremium', cost: 8000, owned: state.hasXPremium, requires: true },
        { id: 'goldCheck', cost: 100000, owned: state.verificationTier === 'gold' || state.verificationTier === 'gray', requires: state.hasXPremium },
        { id: 'grayCheck', cost: 1000000, owned: state.verificationTier === 'gray', requires: state.verificationTier === 'gold' }
    ];

    premiumItems.forEach(item => {
        if (!item.owned && item.requires && state.coins >= item.cost) {
            hasAffordablePremium = true;
        }
    });

    // Update tab indicators
    const botsIndicator = document.getElementById('bots-indicator');
    const upgradesIndicator = document.getElementById('upgrades-indicator');
    const premiumIndicator = document.getElementById('premium-indicator');

    if (botsIndicator) botsIndicator.classList.toggle('has-affordable', hasAffordableBot);
    if (upgradesIndicator) upgradesIndicator.classList.toggle('has-affordable', hasAffordableUpgrade);
    if (premiumIndicator) premiumIndicator.classList.toggle('has-affordable', hasAffordablePremium);
}

/**
 * Show message in event ticker
 */
function showMessage(message) {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = message;
    }
}

/**
 * Format number for display - handles floating point precision
 */
function formatNumber(num) {
    // Round to avoid floating point issues
    const n = Math.round(num * 100) / 100;
    if (n < 1000) {
        // For small numbers, show as integer or with max 1 decimal
        return Number.isInteger(n) ? n.toString() : n.toFixed(1).replace(/\.0$/, '');
    }
    if (n < 1000000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    if (n < 1000000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

export { renderBots, renderUpgradesList, renderPremium, calculateBotCost };
