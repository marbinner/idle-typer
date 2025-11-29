/**
 * Upgrades Module
 * Handles bot purchases, upgrades, and the shop UI
 */

import * as State from '../state.js';
import { BOTS, UPGRADES } from '../data/upgrades.js';
import { playSound } from './sound.js';
import { spawnParticles } from './particles.js';
import { formatNumber, formatCoins } from '../utils.js';

// DOM Elements
let botsListEl;
let upgradesListEl;
let premiumListEl;

// Track if already initialized
let isInitialized = false;

// Prevent race conditions in purchase flow
let tierUpgradePurchasing = false;

/**
 * Initialize the upgrades system
 */
export function initUpgrades() {
    // Cache DOM elements
    botsListEl = document.getElementById('bots-list');
    upgradesListEl = document.getElementById('upgrades-list');
    premiumListEl = document.getElementById('premium-list');

    // Only set up listeners once (prevent duplication on re-init)
    if (!isInitialized) {
        // Set up tab switching
        const tabs = document.querySelectorAll('.panel-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Use event delegation for upgrade items to avoid listener accumulation
        if (botsListEl) {
            botsListEl.addEventListener('click', (e) => {
                const item = e.target.closest('.upgrade-item[data-type="bot"]');
                if (item && item.dataset.id) {
                    handleBotPurchase(item.dataset.id);
                }
            });
        }
        if (upgradesListEl) {
            upgradesListEl.addEventListener('click', (e) => {
                const item = e.target.closest('.upgrade-item[data-type="upgrade"]');
                if (item && item.dataset.id) {
                    handleUpgradePurchase(item.dataset.id);
                }
            });
        }
        if (premiumListEl) {
            premiumListEl.addEventListener('click', (e) => {
                const item = e.target.closest('.upgrade-item[data-type="premium"]');
                if (item && item.dataset.id) {
                    handlePremiumPurchaseById(item.dataset.id);
                }
            });
        }

        // Subscribe to state changes for affordability updates
        State.subscribe(() => {
            updateAffordability();
        });

        isInitialized = true;
    }

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
    const listEl = document.getElementById('bots-list');
    if (!listEl) return;

    const state = State.getState();

    // Get all bots as array with unlock info (based on lifetime coins earned)
    const botIds = Object.keys(BOTS);
    const botsArray = Object.entries(BOTS).map(([id, bot], index) => ({
        id,
        bot,
        isUnlocked: state.lifetimeCoins >= (bot.unlockAt || 0),
        unlockAt: bot.unlockAt || 0,
        botTier: Math.floor(index / 15) + 1  // 15 bots per tier, tiers 1-10
    }));

    // Find first locked bot index
    const firstLockedIndex = botsArray.findIndex(b => !b.isUnlocked);

    // Show unlocked + next 2 locked (teaser)
    const visibleBots = botsArray.filter((b, i) => {
        if (b.isUnlocked) return true;
        if (firstLockedIndex === -1) return false;
        return i <= firstLockedIndex + 1; // Show next 2 locked
    });

    const botsHtml = visibleBots.map(({ id, bot, isUnlocked, botTier }) => {
        const owned = state.bots[id] || 0;
        const cost = calculateBotCost(id, owned);
        const canAfford = state.coins >= cost;

        if (!isUnlocked) {
            // Calculate fade level based on how far away it is (0 = first locked, 1 = second locked, etc.)
            const lockedIndex = botsArray.filter(b => !b.isUnlocked).findIndex(b => b.id === id);
            const fadeLevel = Math.min(lockedIndex, 2); // Max 3 levels of fade

            const unlockFormatted = formatCoins(bot.unlockAt);
            const costFormatted = formatCoins(cost);
            return `
                <div class="upgrade-item locked fade-${fadeLevel} bot-tier-${botTier}" data-type="bot" data-id="${id}">
                    <div class="upgrade-icon locked-icon">🔒</div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">???</div>
                        <div class="upgrade-desc">Unlock at ${unlockFormatted.full} lifetime</div>
                    </div>
                    <div class="upgrade-cost">
                        <span class="cost-icon">${costFormatted.unit}</span>
                        <span class="cost-value locked-cost">${costFormatted.value}</span>
                    </div>
                </div>
            `;
        }

        // Triangular growth: total CPS = baseCPS * n*(n+1)/2
        const totalCPS = owned > 0 ? bot.cps * owned * (owned + 1) / 2 : 0;
        // Next bot gives: baseCPS * (owned + 1)
        const nextBotCPS = bot.cps * (owned + 1);
        const cpsFormatted = formatCoins(nextBotCPS);
        const totalCPSFormatted = formatCoins(totalCPS);

        // Calculate quantity tier for visual effects
        let quantityTier = 0;
        if (owned >= 100) quantityTier = 6;
        else if (owned >= 50) quantityTier = 5;
        else if (owned >= 25) quantityTier = 4;
        else if (owned >= 10) quantityTier = 3;
        else if (owned >= 5) quantityTier = 2;
        else if (owned >= 1) quantityTier = 1;

        // Progress to next tier (for the quantity bar)
        const tierThresholds = [1, 5, 10, 25, 50, 100];
        const currentThreshold = quantityTier > 0 ? tierThresholds[quantityTier - 1] : 0;
        const nextThreshold = tierThresholds[quantityTier] || 100;
        // Guard against division by zero (defensive programming)
        const tierDiff = nextThreshold - currentThreshold;
        const tierProgress = quantityTier >= 6 ? 100 : (tierDiff > 0 ? ((owned - currentThreshold) / tierDiff) * 100 : 0);

        const costFormatted = formatCoins(cost);
        return `
            <div class="upgrade-item ${canAfford ? 'affordable' : ''} quantity-tier-${quantityTier} bot-tier-${botTier}"
                 data-type="bot" data-id="${id}" data-owned="${owned}">
                <div class="upgrade-icon">${bot.icon}${owned > 0 ? `<span class="icon-quantity">${owned}</span>` : ''}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${bot.name} ${owned > 0 ? `<span class="owned-badge tier-${quantityTier}">×${owned}</span>` : ''}</div>
                    <div class="upgrade-desc">${bot.description}</div>
                    ${owned > 0 ? `<div class="current-gen">Generating: <span class="gen-value">+${totalCPSFormatted.full}/s</span></div>` : ''}
                    ${owned > 0 ? `<div class="quantity-bar"><div class="quantity-fill" style="width: ${tierProgress}%"></div></div>` : ''}
                </div>
                <div class="upgrade-right">
                    <div class="buy-gain">
                        <span class="gain-label">BUY FOR</span>
                        <span class="gain-value">+${cpsFormatted.full}/s</span>
                    </div>
                    <div class="upgrade-cost ${canAfford ? 'can-afford' : 'cant-afford'}">
                        <span class="cost-icon">${costFormatted.unit}</span>
                        <span class="cost-value">${costFormatted.value}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    listEl.innerHTML = botsHtml;
    // Click handlers use event delegation from initUpgrades()
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
                        <div class="upgrade-desc">Unlock at ${formatCoins(upgrade.unlockAt).full} lifetime</div>
                    </div>
                    <div class="upgrade-cost">
                        <span class="cost-value locked-cost">${formatCoins(upgrade.unlockAt).full}</span>
                        <span class="cost-label">to unlock</span>
                    </div>
                </div>
            `;
        }

        const costFormatted = formatCoins(cost);
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
                        <span class="cost-icon">${costFormatted.unit}</span>
                        <span class="cost-value">${costFormatted.value}</span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    upgradesListEl.innerHTML = upgradesHtml;
    // Click handlers use event delegation from initUpgrades()
}

/**
 * Render premium list
 */
// Tier upgrade names, descriptions, and unique effects
const TIER_UPGRADES = [
    { name: 'Beginner Boost', icon: '⭐', description: '+50% Tier 1 output', tier: 1, effect: 'cps' },
    { name: 'Creator Pack', icon: '🎬', description: '+25% typing coins', tier: 2, effect: 'typing' },
    { name: 'Specialist Suite', icon: '🔧', description: '+50% Tier 3 output, -10% bot costs', tier: 3, effect: 'cps+discount' },
    { name: 'Influencer Bundle', icon: '📢', description: '+50% follower gains', tier: 4, effect: 'followers' },
    { name: 'Viral Package', icon: '🔥', description: '+50% Tier 5 output, 2x combo bonus', tier: 5, effect: 'cps+combo' },
    { name: 'Elite Upgrade', icon: '💎', description: '+25% all bot output', tier: 6, effect: 'allCps' },
    { name: 'Power Pack', icon: '⚡', description: '+50% Tier 7 output, +50% offline', tier: 7, effect: 'cps+offline' },
    { name: 'Premium Suite', icon: '👑', description: 'Golden chars 2x more frequent', tier: 8, effect: 'golden' },
    { name: 'Legendary Bundle', icon: '🏆', description: '+50% Tier 9 output, +100% impressions', tier: 9, effect: 'cps+impressions' },
    { name: 'Ultimate Ascension', icon: '🌟', description: '2x ALL multipliers!', tier: 10, effect: 'ultimate' },
];

// Get mid-tier bot cost for pricing tier upgrades
function getTierUpgradeCost(tier) {
    const botIds = Object.keys(BOTS);
    // Mid-tier bot index: tier 1 = bot 7, tier 2 = bot 22, etc.
    const midBotIndex = (tier - 1) * 15 + 7;
    const botId = botIds[midBotIndex];
    if (!botId) return 1000000; // fallback
    return BOTS[botId].baseCost;
}

// Check if tier upgrade is unlocked (need to have unlocked at least one bot from that tier)
function isTierUnlocked(tier, state) {
    const botIds = Object.keys(BOTS);
    const tierStartIndex = (tier - 1) * 15;
    const firstBotInTier = botIds[tierStartIndex];
    if (!firstBotInTier) return false;
    // Unlocked if lifetime coins >= first bot's unlock cost
    return state.lifetimeCoins >= (BOTS[firstBotInTier].unlockAt || 0);
}

function renderPremium() {
    if (!premiumListEl) return;

    const state = State.getState();
    const tierUpgrades = state.tierUpgrades || {};

    // Find the highest unlocked tier
    let highestUnlockedTier = 0;
    for (let t = 1; t <= 10; t++) {
        if (isTierUnlocked(t, state)) {
            highestUnlockedTier = t;
        }
    }

    // Build premium items - only show unlocked tiers + next one (hidden preview)
    const premiumItems = TIER_UPGRADES
        .filter(upgrade => upgrade.tier <= highestUnlockedTier + 1)
        .map(upgrade => {
            const cost = getTierUpgradeCost(upgrade.tier);
            const isOwned = tierUpgrades[upgrade.tier] || false;
            const isLocked = !isTierUnlocked(upgrade.tier, state);

            return {
                id: `tier${upgrade.tier}`,
                name: upgrade.name,
                icon: upgrade.icon,
                description: upgrade.description,
                cost,
                owned: isOwned,
                locked: isLocked,
                tier: upgrade.tier,
                effect: () => {
                    const newTierUpgrades = { ...tierUpgrades, [upgrade.tier]: true };
                    State.updateState({ tierUpgrades: newTierUpgrades });
                    State.recalculateDerived();
                }
            };
        });

    const premiumHtml = premiumItems.map(item => {
        const canAfford = state.coins >= item.cost;
        const costFormatted = formatCoins(item.cost);

        if (item.locked) {
            return `
                <div class="upgrade-item locked" data-type="premium" data-id="${item.id}">
                    <div class="upgrade-icon locked-icon">🔒</div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">???</div>
                        <div class="upgrade-desc">Unlock Tier ${item.tier} bots first</div>
                    </div>
                    <div class="upgrade-cost">
                        <span class="cost-value locked-cost">LOCKED</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="upgrade-item ${canAfford && !item.owned ? 'affordable' : ''} ${item.owned ? 'owned' : ''} bot-tier-${item.tier}"
                 data-type="premium" data-id="${item.id}">
                <div class="upgrade-icon">${item.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${item.name}</div>
                    <div class="upgrade-desc">${item.description}</div>
                </div>
                <div class="upgrade-cost ${!item.owned && canAfford ? 'can-afford' : !item.owned ? 'cant-afford' : ''}">
                    ${item.owned ? '<span class="cost-value" style="color: var(--success-green)">OWNED</span>' : `
                        <span class="cost-icon">${costFormatted.unit}</span>
                        <span class="cost-value">${costFormatted.value}</span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    premiumListEl.innerHTML = premiumHtml;
    // Click handlers use event delegation from initUpgrades()
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
        showMessage(`Unlock at ${formatCoins(bot.unlockAt).full} lifetime!`);
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
        showMessage(`Unlock at ${formatCoins(upgrade.unlockAt).full} lifetime!`);
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
 * Get premium items with current state
 */
function getPremiumItems() {
    const state = State.getState();
    return [
        {
            id: 'xPremium',
            name: 'X Premium',
            icon: '✓',
            description: 'Get verified and unlock premium features',
            cost: 8000,
            owned: state.hasXPremium,
            requires: true,
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
}

/**
 * Handle premium purchase by ID (for event delegation)
 */
function handlePremiumPurchaseById(premiumId) {
    // Check if it's a tier upgrade
    if (premiumId.startsWith('tier')) {
        const tier = parseInt(premiumId.replace('tier', ''), 10);
        handleTierUpgradePurchase(tier);
        return;
    }

    // Otherwise use old premium items
    const premiumItems = getPremiumItems();
    const item = premiumItems.find(p => p.id === premiumId);
    if (item) {
        handlePremiumPurchase(item);
    }
}

/**
 * Handle tier upgrade purchase
 */
function handleTierUpgradePurchase(tier) {
    // Prevent race condition from rapid double-clicks
    if (tierUpgradePurchasing) return;
    tierUpgradePurchasing = true;

    try {
        const state = State.getState();
        const tierUpgrades = state.tierUpgrades || {};

        if (tierUpgrades[tier]) {
            showMessage('Already owned!');
            return;
        }

        if (!isTierUnlocked(tier, state)) {
            showMessage(`Unlock Tier ${tier} bots first!`);
            return;
        }

        const cost = getTierUpgradeCost(tier);
        if (State.spendCoins(cost)) {
            const newTierUpgrades = { ...tierUpgrades, [tier]: true };
            State.updateState({ tierUpgrades: newTierUpgrades });
            State.recalculateDerived();
            playSound('premium');

            // Celebration
            const panel = document.getElementById('premium-list');
            if (panel) {
                const rect = panel.getBoundingClientRect();
                spawnParticles('confetti', rect.left + rect.width / 2, rect.top, 50);
            }

            renderPremium();
            showMessage(`Tier ${tier} boost unlocked! +50% output!`);
        } else {
            showMessage('Not enough coins!');
            playSound('error');
        }
    } finally {
        tierUpgradePurchasing = false;
    }
}

/**
 * Handle premium purchase
 */
function handlePremiumPurchase(item) {
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

    // Get discount from Tier 3 upgrade
    const state = State.getState();
    const discount = state.botCostDiscount || 1;

    // Exponential scaling with softcap
    let cost;
    if (owned < 25) {
        cost = bot.baseCost * Math.pow(bot.costMult || 1.15, owned);
    } else {
        const softcapCost = bot.baseCost * Math.pow(bot.costMult || 1.15, 25);
        const extra = owned - 25;
        cost = softcapCost * Math.pow(1.05, extra);
    }

    return Math.floor(cost * discount);
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

        // Update cost text color
        const costEl = item.querySelector('.upgrade-cost');
        if (costEl && isUnlocked) {
            costEl.classList.toggle('can-afford', canAfford);
            costEl.classList.toggle('cant-afford', !canAfford);
        }
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

        // Update cost text color
        const costEl = item.querySelector('.upgrade-cost');
        if (costEl && isUnlocked && !isMaxed) {
            costEl.classList.toggle('can-afford', canAfford);
            costEl.classList.toggle('cant-afford', !canAfford);
        }
    });

    // Check tier upgrade affordability
    const tierUpgrades = state.tierUpgrades || {};
    for (let tier = 1; tier <= 10; tier++) {
        const isOwned = tierUpgrades[tier] || false;
        const isLocked = !isTierUnlocked(tier, state);
        if (isOwned || isLocked) continue;

        const cost = getTierUpgradeCost(tier);
        const canAfford = state.coins >= cost;
        if (canAfford) {
            hasAffordablePremium = true;
        }

        // Update tier upgrade affordability in DOM
        const itemEl = document.querySelector(`[data-type="premium"][data-id="tier${tier}"]`);
        if (itemEl) {
            itemEl.classList.toggle('affordable', canAfford);
            const costEl = itemEl.querySelector('.upgrade-cost');
            if (costEl) {
                costEl.classList.toggle('can-afford', canAfford);
                costEl.classList.toggle('cant-afford', !canAfford);
            }
        }
    }

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

export { renderBots, renderUpgradesList, renderPremium, calculateBotCost };
